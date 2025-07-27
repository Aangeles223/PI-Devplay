import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

export default function NotificationsScreen({ navigation }) {
  const { theme, getText } = useTheme();
  const [notifications, setNotifications] = useState({
    newGames: true,
    offers: true,
    downloads: false,
    updates: true,
  });

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

  const recentNotifications = [
    {
      id: 1,
      title: "🎮 " + getText("newGameAvailable"),
      description: getText("codNewSeason"),
      time: getText("hoursAgo", "2"),
      icon: "game-controller",
      color: "#4CAF50",
    },
    {
      id: 2,
      title: "💰 " + getText("specialOffer"),
      description: getText("minecraftDiscount"),
      time: getText("hoursAgo", "5"),
      icon: "pricetag",
      color: "#FF9800",
    },
    {
      id: 3,
      title: "⬇️ " + getText("downloadComplete"),
      description: getText("pubgDownloaded"),
      time: getText("yesterday"),
      icon: "checkmark-circle",
      color: "#2196F3",
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

      <ScrollView style={styles.content}>
        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            {getText("configuration")}
          </Text>
          {notificationItems.map((item) => (
            <View
              key={item.id}
              style={[
                styles.settingItem,
                { backgroundColor: theme.cardBackground },
              ]}
            >
              <View style={styles.settingLeft}>
                <Ionicons name={item.icon} size={24} color={theme.iconColor} />
                <View style={styles.settingText}>
                  <Text
                    style={[styles.settingTitle, { color: theme.textColor }]}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={[
                      styles.settingDescription,
                      { color: theme.secondaryTextColor },
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

        {/* Recent Notifications */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            {getText("recentNotifications")}
          </Text>
          {recentNotifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationItem,
                { backgroundColor: theme.cardBackground },
              ]}
            >
              <View
                style={[
                  styles.notificationIcon,
                  { backgroundColor: notification.color },
                ]}
              >
                <Ionicons name={notification.icon} size={20} color="white" />
              </View>
              <View style={styles.notificationContent}>
                <Text
                  style={[styles.notificationTitle, { color: theme.textColor }]}
                >
                  {notification.title}
                </Text>
                <Text
                  style={[
                    styles.notificationDescription,
                    { color: theme.secondaryTextColor },
                  ]}
                >
                  {notification.description}
                </Text>
                <Text
                  style={[
                    styles.notificationTime,
                    { color: theme.secondaryTextColor },
                  ]}
                >
                  {notification.time}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: "white",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: "white",
    marginTop: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
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
    borderBottomColor: "#f0f0f0",
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
    color: "#333",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: "#666",
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
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
    color: "#333",
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: "#999",
  },
});
