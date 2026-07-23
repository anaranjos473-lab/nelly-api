function createAuditConsumer({ logger = console } = {}) {
  const records = [];

  function onEvent(event) {
    const record = {
      tipo: event?.tipo || null,
      aggregate_id: event?.aggregate_id || null,
      ocurrido_en: event?.ocurrido_en || null,
      registrado_en: event?.registrado_en || null,
      source: event?.metadata?.source || null,
      contract_version: event?.metadata?.contract_version || null,
      actor_tipo: event?.actor?.tipo || null,
      actor_uid: event?.actor?.uid || null,
      payload: event?.payload || {}
    };

    records.push(record);
    logger.info?.('[AuditConsumer]', JSON.stringify(record));
    return record;
  }

  function getRecords() {
    return [...records];
  }

  return {
    onEvent,
    getRecords
  };
}

export {
  createAuditConsumer
};
