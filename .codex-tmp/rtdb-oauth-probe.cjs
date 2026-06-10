const fs = require("fs/promises")
const crypto = require("crypto")

const abortAfter = (ms) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  return { controller, timer }
}

const base64url = (input) => Buffer.from(input).toString("base64")
  .replace(/=/g, "")
  .replace(/\+/g, "-")
  .replace(/\//g, "_")

const signJwt = (privateKey, header, payload) => {
  const encodedHeader = base64url(JSON.stringify(header))
  const encodedPayload = base64url(JSON.stringify(payload))
  const data = encodedHeader + "." + encodedPayload
  const signature = crypto.sign("RSA-SHA256", Buffer.from(data), privateKey)
  return data + "." + base64url(signature)
}

;(async () => {
  const sa = JSON.parse(await fs.readFile("C:/Users/hp14/OneDrive/Desktop/nelly/nelly-admin.json", "utf8"))
  const now = Math.floor(Date.now() / 1000)
  const assertion = signJwt(sa.private_key, { alg: "RS256", typ: "JWT" }, {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/userinfo.email",
    aud: sa.token_uri || "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600
  })

  const tokenForm = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion
  })

  const tokenProbe = abortAfter(12000)
  const tokenResponse = await fetch(sa.token_uri || "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: tokenForm,
    signal: tokenProbe.controller.signal
  })
  clearTimeout(tokenProbe.timer)

  const tokenText = await tokenResponse.text()
  if (!tokenResponse.ok) {
    console.error("TOKEN_ERROR")
    console.error(tokenText)
    process.exit(1)
  }

  const tokenJson = JSON.parse(tokenText)
  const accessToken = tokenJson.access_token
  if (!accessToken) {
    console.error("NO_ACCESS_TOKEN")
    console.error(tokenText)
    process.exit(1)
  }

  const mode = process.argv[2] || "paths"
  const args = process.argv.slice(3)

  const probe = async (url) => {
    const pair = abortAfter(12000)
    try {
      const response = await fetch(url, {
        headers: { Authorization: "Bearer " + accessToken },
        signal: pair.controller.signal
      })
      const body = await response.text()
      return { url, status: response.status, ok: response.ok, body: body.slice(0, 5000) }
    } catch (err) {
      return { url, error: err.name + ": " + err.message }
    } finally {
      clearTimeout(pair.timer)
    }
  }

  const probePath = async (path) => {
    const cleanPath = String(path || "").replace(/^\/+|\/+$/g, "")
    const url = "https://nelly-delivery-default-rtdb.firebaseio.com/" + cleanPath + ".json"
    return {
      path: cleanPath,
      ...await probe(url)
    }
  }

  let result
  if (mode === "keys") {
    result = {
      pedidos: await probe("https://nelly-delivery-default-rtdb.firebaseio.com/pedidos.json?shallow=true"),
      pedidos_para_reparto: await probe("https://nelly-delivery-default-rtdb.firebaseio.com/pedidos_para_reparto.json?shallow=true")
    }
  } else if (mode === "paths") {
    const paths = args.length > 0 ? args : ["pedidos/AUTO_1776635500427", "pedidos_para_reparto/AUTO_1776635500427"]
    result = {}
    for (const path of paths) {
      result[path] = await probePath(path)
    }
  } else if (mode === "multi") {
    const id = args[0] || "AUTO_1776635500427"
    const uid = args[1] || "fE8uV6dke3XziYNhuO3kZU93xQj1"
    const paths = [
      `repartidores/${uid}/finanzas`,
      `repartidores/${uid}/billetera`,
      `repartidores/${uid}/historial_ventas`,
      `liquidaciones`,
      `liquidaciones_auditoria`,
      `finanzas`,
      `historial_ventas`,
      `pedidos/${id}`,
      `pedidos_para_reparto/${id}`,
      `pedidos_en_camino/${id}`
    ]
    result = {}
    for (const path of paths) {
      result[path] = await probePath(path)
    }
  } else {
    const id = args[0] || "AUTO_1776635500427"
    result = {
      pedidoId: id,
      pedidos: await probe("https://nelly-delivery-default-rtdb.firebaseio.com/pedidos/" + id + ".json"),
      pedidos_para_reparto: await probe("https://nelly-delivery-default-rtdb.firebaseio.com/pedidos_para_reparto/" + id + ".json")
    }
  }

  console.log(JSON.stringify(result, null, 2))
})().catch(err => {
  console.error(err)
  process.exit(1)
})
