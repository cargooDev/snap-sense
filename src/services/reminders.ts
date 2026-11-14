import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Show the notification even if the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function ensurePermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    // Android 8+ requires a channel before any notification can appear.
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Screenshot reminders',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  return (await Notifications.requestPermissionsAsync()).granted;
}

// Returns the notification id so we can cancel it later.
export async function scheduleReminder(title: string, body: string, when: Date): Promise<string> {
  if (!(await ensurePermission())) throw new Error('Notification permission denied');
  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when, channelId: 'reminders' },
  });
}

export async function cancelReminder(notificationId: string | null) {
  if (notificationId) await Notifications.cancelScheduledNotificationAsync(notificationId);
}
