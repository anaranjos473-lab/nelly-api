require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

function nowIsoSafe() {
  return new Date().toISOString().replace(/:/g, '-');
}

function ensureLogsDir() {
  const logsDir = path.resolve(__dirname, '..', '..', 'logs_pruebas');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  return logsDir;
}

function writeValidationLog(payload) {
  const logsDir = ensureLogsDir();
  const fileName = `security_validation_prod_${nowIsoSafe()}.json`;
  const filePath = path.join(logsDir, fileName);
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
  return filePath;
}

function requiredEnv(name) {
  const value = String(process.env[name] || '').trim();
  if (!value) {
    throw new Error(`Falta variable de entorno requerida: ${name}`);
  }
  return value;
}

function numberEnv(name, fallback) {
  const raw = String(process.env[name] || '').trim();
  if (!raw) {
    return fallback;
  }
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error(`Variable ${name} debe ser numero > 0`);
  }
  return n;
}

async function postJson(url, token, body) {
  try {
    const res = await axios.post(url, body, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 20000,
      validateStatus: () => true,
    });
    return {
      status: res.status,
      body: res.data,
      ok: res.status >= 200 && res.status < 300,
    };
  } catch (error) {
    return {
      status: 0,
      body: { error: error.message },
      ok: false,
    };
  }
}

async function run() {
  const baseUrl = requiredEnv('SECURITY_BASE_URL');
  const driverToken = requiredEnv('SECURITY_DRIVER_ID_TOKEN');
  const panelToken = requiredEnv('SECURITY_PANEL_ID_TOKEN');
  const driverUid = requiredEnv('SECURITY_DRIVER_UID');
  const pedidoId = requiredEnv('SECURITY_PEDIDO_ID');
  const pedidoRepartoId = requiredEnv('SECURITY_PEDIDO_REPARTO_ID');
  const montoCobro = numberEnv('SECURITY_MONTO_COBRO', 350);
  const montoPago = numberEnv('SECURITY_MONTO_PAGO', 350);

  const result = {
    fecha_iso: new Date().toISOString(),
    prueba: 'certificacion_prod_bloqueo_automatico_por_deuda',
    config: {
      base_url: baseUrl,
      driver_uid: driverUid,
      pedido_id: pedidoId,
      pedido_reparto_id: pedidoRepartoId,
      monto_cobro: montoCobro,
      monto_pago: montoPago,
    },
    pasos: [],
    exitoso: false,
    error: null,
  };

  try {
    const cobro = await postJson(
      `${baseUrl}/api/delivery/finanzas/registrar-cobro-efectivo`,
      driverToken,
      { pedidoId, monto_efectivo: montoCobro }
    );
    result.pasos.push({ paso: 'registrar_cobro_efectivo', ...cobro });

    const cobroBloquea = cobro.ok && cobro.body && cobro.body.bloqueadoPorDeuda === true;
    if (!cobroBloquea) {
      throw new Error('El cobro no activo bloqueo por deuda como se esperaba');
    }

    const acceptBloqueado = await postJson(
      `${baseUrl}/api/delivery/accept-order`,
      driverToken,
      { pedidoId: pedidoRepartoId }
    );
    result.pasos.push({ paso: 'accept_order_bloqueado', ...acceptBloqueado });

    const detalleError = String(acceptBloqueado.body?.error || '').toLowerCase();
    const denegadoPorDeuda = acceptBloqueado.status === 403
      && (detalleError.includes('deuda') || detalleError.includes('limite'));
    if (!denegadoPorDeuda) {
      throw new Error('accept-order no devolvio bloqueo por deuda en estado bloqueado');
    }

    const pago = await postJson(
      `${baseUrl}/api/panel/finanzas/registrar-pago-deuda`,
      panelToken,
      { uid: driverUid, monto_pago: montoPago }
    );
    result.pasos.push({ paso: 'registrar_pago_deuda', ...pago });

    const pagoDesbloquea = pago.ok && pago.body && pago.body.bloqueadoPorDeuda === false;
    if (!pagoDesbloquea) {
      throw new Error('El pago no removio bloqueo por deuda como se esperaba');
    }

    const acceptPostPago = await postJson(
      `${baseUrl}/api/delivery/accept-order`,
      driverToken,
      { pedidoId: pedidoRepartoId }
    );
    result.pasos.push({ paso: 'accept_order_post_pago', ...acceptPostPago });

    const notDebtBlocked = !(
      acceptPostPago.status === 403
      && String(acceptPostPago.body?.error || '').toLowerCase().includes('deuda')
    );
    if (!notDebtBlocked) {
      throw new Error('accept-order sigue bloqueado por deuda despues de registrar pago');
    }

    result.exitoso = true;
    const logPath = writeValidationLog(result);
    console.log(`[SECURITY_PROD] OK - Certificacion exitosa. Log: ${logPath}`);
    process.exit(0);
  } catch (error) {
    result.exitoso = false;
    result.error = {
      message: error.message || String(error),
    };
    const logPath = writeValidationLog(result);
    console.error(`[SECURITY_PROD] FAIL - ${result.error.message}. Log: ${logPath}`);
    process.exit(1);
  }
}

run();
