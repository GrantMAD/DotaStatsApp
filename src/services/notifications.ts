import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#8b5cf6',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      throw new Error('Failed to get push token for push notification!');
    }
    
    // Note: Project ID is required for Expo Push Token
    // We try to get it from Expo config, but if it's missing, it might fail in some environments
    try {
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Push Token:', token);
    } catch (e) {
      console.error('Error getting push token:', e);
      throw e;
    }
  } else {
    console.log('Must use physical device for Push Notifications');
    throw new Error('Must use physical device for Push Notifications');
  }

  return token;
}

export function addNotificationListeners(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationResponseReceived?: (response: Notifications.NotificationResponse) => void
) {
  const notificationListener = Notifications.addNotificationReceivedListener(notification => {
    if (onNotificationReceived) onNotificationReceived(notification);
  });

  const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    if (onNotificationResponseReceived) onNotificationResponseReceived(response);
  });

  return () => {
    notificationListener.remove();
    responseListener.remove();
  };
}
