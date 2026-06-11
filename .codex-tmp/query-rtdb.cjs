const fs = require("fs/promises")
const timer = setTimeout(() => {
  console.error("TIMEOUT")
  process.exit(2)
}, 12000)
;(async () => {
  const adminMod = await import("firebase-admin")
  const admin = adminMod.default || adminMod
  const sa = JSON.parse(await fs.readFile("C:/Users/hp14/OneDrive/Desktop/nelly/nelly-admin.json", "utf8"))
  admin.initializeApp({
    credential: admin.credential.cert(sa),
    databaseURL: "https://nelly-delivery-default-rtdb.firebaseio.com"
  })
  const id = "AUTO_1776635500427"
  const [a, b] = await Promise.all([
    admin.database().ref("pedidos/" + id).get(),
    admin.database().ref("pedidos_para_reparto/" + id).get()
  ])
  clearTimeout(timer)
  console.log(JSON.stringify({
    pedidoId: id,
    pedidos: { exists: a.exists(), value: a.val() },
    pedidos_para_reparto: { exists: b.exists(), value: b.val() }
  }, null, 2))
})().catch(err => {
  clearTimeout(timer)
  console.error(err)
  process.exit(1)
})
