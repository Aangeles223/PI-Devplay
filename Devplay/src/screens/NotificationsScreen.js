import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { UserContext } from "../context/UserContext";
import { getNotificacionesByUser } from "../services/api";
import Notifications from "../services/notifications";

export default function NotificationsScreen({ navigation }) {
  // Subscribe to incoming notifications and append to list
  useEffect(() => {
    if (
      Platform.OS !== "web" &&
      Notifications.addNotificationReceivedListener
    ) {
      const subscription = Notifications.addNotificationReceivedListener(
        ({ request }) => {
          const { body } = request.content;
          const newNotification = {
            id: Date.now(),
            descripcion: body,
            fecha_creacion: new Date().toISOString(),
          };
          setNotificationsList((prev) => [newNotification, ...prev]);
        }
      );
      return () => subscription.remove();
    }
  }, []);
  const { theme, getText } = useTheme();
  const { usuario } = useContext(UserContext);
  const [notifications, setNotifications] = useState({
    newGames: true,
    offers: true,
    downloads: false,
    updates: true,
  });
  const [notificationsList, setNotificationsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!usuario) return;
    setLoading(true);
    getNotificacionesByUser(usuario.id)
      .then((res) => setNotificationsList(res.data))
      .catch((e) => console.warn("Error fetching notifications", e))
      .finally(() => setLoading(false));
  }, [usuario]);

  const handleToggle = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const notificationItems = [
    {
      id: 1,
      title: getText("newReleases"),
      description: getText("newGamesDesc"),
      key: "newGames",
      icon: "game-controller-outline",
    },
    {
      id: 2,
      title: getText("offersDeals"),
      description: getText("offersDesc"),
      key: "offers",
      icon: "pricetag-outline",
    },
    {
      id: 3,
      title: getText("downloadsCompleted"),
      description: getText("downloadsDesc"),
      key: "downloads",
      icon: "download-outline",
    },
    {
      id: 4,
      title: getText("gameUpdates"),
      description: getText("updatesDesc"),
      key: "updates",
      icon: "refresh-outline",
    },
  ];

  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.backgroundColor }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={theme.textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textColor }]}>
          {getText("notifications")}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.content}>
          {/* Settings Section */}
          <View
            style={[styles.section, { backgroundColor: theme.cardBackground }]}
          >
            <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
              {getText("configuration")}
            </Text>
            {notificationItems.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.settingItem,
                  {
                    backgroundColor: theme.cardBackground,
                    borderBottomColor: theme.border,
                  },
                ]}
              >
                <View style={styles.settingLeft}>
                  <Ionicons
                    name={item.icon}
                    size={24}
                    color={theme.iconColor}
                  />
                  <View style={styles.settingText}>
                    <Text
                      style={[styles.settingTitle, { color: theme.textColor }]}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={[
                        styles.settingDescription,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {item.description}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={notifications[item.key]}
                  onValueChange={() => handleToggle(item.key)}
                  trackColor={{ false: "#767577", true: "#007AFF" }}
                  thumbColor={notifications[item.key] ? "#fff" : "#f4f3f4"}
                />
              </View>
            ))}
          </View>
          {/* Loading Indicator */}
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            {getText("loading")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={notificationsList}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{
            flexGrow: 1,
            backgroundColor: theme.backgroundColor,
          }}
          ListHeaderComponent={() => (
            <>
              {/* Settings Section */}
              <View
                style={[
                  styles.section,
                  { backgroundColor: theme.cardBackground },
                ]}
              >
                <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
                  {getText("configuration")}
                </Text>
                {notificationItems.map((item) => (
                  <View
                    key={item.id}
                    style={[
                      styles.settingItem,
                      {
                        backgroundColor: theme.cardBackground,
                        borderBottomColor: theme.border,
                      },
                    ]}
                  >
                    <View style={styles.settingLeft}>
                      <Ionicons
                        name={item.icon}
                        size={24}
                        color={theme.iconColor}
                      />
                      <View style={styles.settingText}>
                        <Text
                          style={[
                            styles.settingTitle,
                            { color: theme.textColor },
                          ]}
                        >
                          {item.title}
                        </Text>
                        <Text
                          style={[
                            styles.settingDescription,
                            { color: theme.textSecondary },
                          ]}
                        >
                          {item.description}
                        </Text>
                      </View>
                    </View>
                    <Switch
                      value={notifications[item.key]}
                      onValueChange={() => handleToggle(item.key)}
                      trackColor={{ false: "#767577", true: "#007AFF" }}
                      thumbColor={notifications[item.key] ? "#fff" : "#f4f3f4"}
                    />
                  </View>
                ))}
              </View>
              {/* Notifications Title */}
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.textColor, marginVertical: 10 },
                ]}
              >
                {getText("recentNotifications")}
              </Text>
            </>
          )}
          ListEmptyComponent={() => (
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              {getText("noNotifications")}
            </Text>
          )}
          ItemSeparatorComponent={() => (
            <View
              style={[styles.separator, { backgroundColor: theme.border }]}
            />
          )}
          renderItem={({ item }) => (
            <View
              style={[
                styles.notificationItem,
                { backgroundColor: theme.cardBackground },
              ]}
            >
              <View style={styles.notificationIcon}>
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color={theme.primary}
                />
              </View>
              <View style={styles.notificationContent}>
                <Text
                  style={[
                    styles.notificationDescription,
                    { color: theme.textColor },
                  ]}
                >
                  {item.descripcion}
                </Text>
                <Text
                  style={[
                    styles.notificationTime,
                    { color: theme.textSecondary },
                  ]}
                >
                  {new Date(item.fecha_creacion).toLocaleString()}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingText: {
    marginLeft: 15,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 0,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
  },
  // Separator between items
  separator: {
    height: 1,
    width: "100%",
  },
  // Text when no notifications
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 20,
  },
  // Text while loading notifications
  loadingText: {
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 20,
  },
  loadingText: {
    textAlign: "center",
    paddingVertical: 20,
  },
  emptyText: {
    textAlign: "center",
    paddingVertical: 20,
  },
  separator: {
    height: 1,
    width: "100%",
  },
});
