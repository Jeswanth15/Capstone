import { getPendingOfflineActions, clearPendingOfflineActions } from './offlineStorage';
import { submitPracticeResult } from '../services/practiceService';

const NOTIF_SETTINGS_KEY = 'eduai_notif_settings';

export const DEFAULT_NOTIF_SETTINGS = {
  dailyMissions: true,
  weeklyChallenges: true,
  assignments: true,
  attendance: true,
  mockTests: true,
  announcements: true,
  leaderboard: true,
  achievements: true,
  xpRewards: true,
  coins: true,
};

export const getNotificationSettings = () => {
  try {
    const saved = localStorage.getItem(NOTIF_SETTINGS_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_NOTIF_SETTINGS;
  } catch (e) {
    return DEFAULT_NOTIF_SETTINGS;
  }
};

export const saveNotificationSettings = (settings) => {
  localStorage.setItem(NOTIF_SETTINGS_KEY, JSON.stringify(settings));
};

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported in this browser.');
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const sendLocalNotification = (title, body, category = 'announcements', url = '/') => {
  const settings = getNotificationSettings();
  if (settings[category] === false) {
    console.log(`Notification category "${category}" disabled in settings.`);
    return;
  }

  // Also dispatch in-app notification event for Header Notification Center
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('eduai-notification-received', {
        detail: { title, body, category, url },
      })
    );
  }

  if ('Notification' in window && Notification.permission === 'granted') {
    if (navigator.serviceWorker && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          data: { url },
          vibrate: [200, 100, 200],
        });
      });
    } else {
      new Notification(title, {
        body,
        icon: '/icons/icon-192x192.png',
      });
    }
  }
};

// Automatic Background Sync on Connection Restore
export const syncPendingActionsOnReconnect = async () => {
  try {
    const pending = await getPendingOfflineActions();
    if (!pending || pending.length === 0) return;

    console.log('[PWA Sync] Reconnected! Syncing pending actions:', pending.length);

    for (const action of pending) {
      if (action.type === 'PRACTICE_RESULT') {
        await submitPracticeResult(action.payload);
      }
    }

    await clearPendingOfflineActions();
    sendLocalNotification(
      '⚡ Offline Actions Synced!',
      'Your offline progress and quizzes have been synchronized with EduAI server.',
      'achievements'
    );
  } catch (err) {
    console.error('[PWA Sync] Error syncing pending actions:', err);
  }
};

// Global Online Listener
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    syncPendingActionsOnReconnect();
  });
}
