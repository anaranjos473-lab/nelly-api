function normalizeNotification(notification = {}) {
  return {
    ...notification,
    channel: String(notification.channel || '').trim().toLowerCase(),
    message: String(notification.message || '').trim(),
    active: notification.active !== false
  };
}

function buildNotificationProjection(notifications = []) {
  const normalizedNotifications = notifications.map(normalizeNotification);
  const validation = normalizedNotifications.map((notification) => ({
    id: notification.id,
    ok: Boolean(notification.id && notification.channel && notification.message)
  }));
  const ok = validation.every((entry) => entry.ok);

  const summary = normalizedNotifications.reduce((acc, notification) => {
    acc.byChannel[notification.channel] = (acc.byChannel[notification.channel] || 0) + 1;
    acc.active += notification.active ? 1 : 0;
    return acc;
  }, { byChannel: {}, active: 0 });

  return {
    ok,
    notifications: normalizedNotifications,
    validation,
    summary
  };
}

export {
  normalizeNotification,
  buildNotificationProjection
};
