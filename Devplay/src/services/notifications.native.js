import * as Notifications from "expo-notifications";

// Configure notification handler for native platforms
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default Notifications;
