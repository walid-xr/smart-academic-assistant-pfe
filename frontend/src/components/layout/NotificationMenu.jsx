import { useEffect, useMemo, useState } from 'react';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { formatNotificationTypeLabel } from '../../utils/labels';

const formatNotificationDate = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })}`;
};

const NotificationMenu = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications]
  );
  const unreadLabel = unreadCount > 99 ? '99+' : String(unreadCount);

  const fetchNotifications = async () => {
    if (!user) {
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/notifications');
      setNotifications(response.data);
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Impossible de charger les notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const intervalId = window.setInterval(fetchNotifications, 30000);

    return () => window.clearInterval(intervalId);
  }, [user?.id]);

  const handleToggle = async () => {
    const nextOpen = !open;
    setOpen(nextOpen);

    if (nextOpen) {
      await fetchNotifications();
    }
  };

  const markAsRead = async (notificationId) => {
    await api.put(`/notifications/${notificationId}/read`);
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === notificationId ? { ...notification, is_read: 1 } : notification
      )
    );
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter((notification) => !notification.is_read);

    await Promise.all(
      unreadNotifications.map((notification) => api.put(`/notifications/${notification.id}/read`))
    );

    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({ ...notification, is_read: 1 }))
    );
  };

  return (
    <div className="notification-menu">
      <button
        type="button"
        className="notification-trigger"
        onClick={handleToggle}
        aria-expanded={open}
        aria-label={
          unreadCount > 0
            ? `Ouvrir les notifications, ${unreadCount} non lues`
            : 'Ouvrir les notifications'
        }
      >
        <svg
          className="notification-trigger__icon"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M18 9.5a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10 20a2.2 2.2 0 0 0 4 0"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        {unreadCount > 0 && <span className="notification-trigger__badge">{unreadLabel}</span>}
      </button>

      {open && (
        <div className="notification-panel">
          <div className="notification-panel__header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button type="button" className="btn btn-sm btn-outline-primary" onClick={markAllAsRead}>
                Tout marquer lu
              </button>
            )}
          </div>

          {loading ? (
            <div className="notification-empty">Chargement des notifications...</div>
          ) : error ? (
            <div className="notification-empty notification-empty--error">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="notification-empty">Aucune notification pour le moment.</div>
          ) : (
            <div className="notification-list">
              {notifications.slice(0, 8).map((notification) => (
                <div
                  key={notification.id}
                  className={
                    notification.is_read
                      ? 'notification-item'
                      : 'notification-item notification-item--unread'
                  }
                >
                  <div>
                    <span className={`notification-item__type notification-item__type--${notification.type}`}>
                      {formatNotificationTypeLabel(notification.type)}
                    </span>
                    <p>{notification.message}</p>
                    <time>{formatNotificationDate(notification.created_at)}</time>
                  </div>

                  {!notification.is_read && (
                    <button
                      type="button"
                      className="notification-item__action"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Marquer lu
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationMenu;
