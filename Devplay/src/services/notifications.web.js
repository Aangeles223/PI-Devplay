// Stub notifications for web platform
const Notifications = {
  scheduleNotificationAsync: () => Promise.resolve(),
  getPermissionsAsync: () => Promise.resolve({ status: "granted" }),
  requestPermissionsAsync: () => Promise.resolve({ status: "granted" }),
  addNotificationReceivedListener: () => ({ remove: () => {} }),
};
export default Notifications;
