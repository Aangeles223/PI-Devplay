import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

export default function DownloadsScreen({ navigation }) {
  const { theme, getText } = useTheme();
  const [activeTab, setActiveTab] = useState("downloaded");

  // Mock data for downloaded apps
  const downloadedApps = [
    {
      id: "1",
      name: "WhatsApp",
      category: "Comunicación",
      size: "89.2 MB",
      downloadDate: "15 Ene 2024",
      version: "2.24.1.78",
      icon: "logo-whatsapp",
      status: "completed",
    },
    {
      id: "2",
      name: "Instagram",
      category: "Redes sociales",
      size: "156.8 MB",
      downloadDate: "12 Ene 2024",
      version: "312.0.0.37.120",
      icon: "logo-instagram",
      status: "completed",
    },
    {
      id: "3",
      name: "Spotify",
      category: "Música",
      size: "95.4 MB",
      downloadDate: "10 Ene 2024",
      version: "8.8.96.488",
      icon: "musical-notes",
      status: "completed",
    },
  ];

  // Mock data for pending downloads
  const pendingApps = [
    {
      id: "4",
      name: "Netflix",
      category: "Entretenimiento",
      size: "215.6 MB",
      icon: "play-circle",
      status: "pending",
    },
    {
      id: "5",
      name: "Uber",
      category: "Viajes",
      size: "78.9 MB",
      icon: "car",
      status: "pending",
    },
  ];

  // Mock data for downloading apps
  const downloadingApps = [
    {
      id: "6",
      name: "TikTok",
      category: "Redes sociales",
      size: "198.3 MB",
      downloaded: "145.2 MB",
      progress: 73,
      icon: "musical-note",
      status: "downloading",
    },
    {
      id: "7",
      name: "YouTube",
      category: "Entretenimiento",
      size: "132.7 MB",
      downloaded: "45.8 MB",
      progress: 34,
      icon: "logo-youtube",
      status: "downloading",
    },
  ];

  const tabs = [
    {
      id: "downloaded",
      title: getText("downloaded"),
      count: downloadedApps.length,
    },
    {
      id: "downloading",
      title: getText("downloading"),
      count: downloadingApps.length,
    },
    { id: "pending", title: getText("pending"), count: pendingApps.length },
  ];

  const getCurrentData = () => {
    switch (activeTab) {
      case "downloaded":
        return downloadedApps;
      case "downloading":
        return downloadingApps;
      case "pending":
        return pendingApps;
      default:
        return [];
    }
  };

  const renderDownloadedApp = ({ item }) => (
    <View style={[styles.appItem, { backgroundColor: theme.cardBackground }]}>
      <View style={styles.appIcon}>
        <Ionicons name={item.icon} size={40} color="#8E44AD" />
      </View>
      <View style={styles.appInfo}>
        <Text style={[styles.appName, { color: theme.textColor }]}>
          {item.name}
        </Text>
        <Text style={[styles.appCategory, { color: theme.secondaryTextColor }]}>
          {item.category}
        </Text>
        <Text style={[styles.appDetails, { color: theme.secondaryTextColor }]}>
          {item.size} • {item.downloadDate}
        </Text>
        <Text style={[styles.appVersion, { color: theme.secondaryTextColor }]}>
          Versión {item.version}
        </Text>
      </View>
      <TouchableOpacity style={styles.actionButton}>
        <Ionicons
          name="ellipsis-vertical"
          size={20}
          color={theme.secondaryTextColor}
        />
      </TouchableOpacity>
    </View>
  );

  const renderDownloadingApp = ({ item }) => (
    <View style={[styles.appItem, { backgroundColor: theme.cardBackground }]}>
      <View style={styles.appIcon}>
        <Ionicons name={item.icon} size={40} color="#8E44AD" />
      </View>
      <View style={styles.appInfo}>
        <Text style={[styles.appName, { color: theme.textColor }]}>
          {item.name}
        </Text>
        <Text style={[styles.appCategory, { color: theme.secondaryTextColor }]}>
          {item.category}
        </Text>
        <Text style={[styles.appDetails, { color: theme.secondaryTextColor }]}>
          {item.downloaded} de {item.size}
        </Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${item.progress}%` }]}
            />
          </View>
          <Text
            style={[styles.progressText, { color: theme.secondaryTextColor }]}
          >
            {item.progress}%
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.pauseButton}>
        <Ionicons name="pause" size={20} color={theme.secondaryTextColor} />
      </TouchableOpacity>
    </View>
  );

  const renderPendingApp = ({ item }) => (
    <View style={[styles.appItem, { backgroundColor: theme.cardBackground }]}>
      <View style={styles.appIcon}>
        <Ionicons name={item.icon} size={40} color="#8E44AD" />
      </View>
      <View style={styles.appInfo}>
        <Text style={[styles.appName, { color: theme.textColor }]}>
          {item.name}
        </Text>
        <Text style={[styles.appCategory, { color: theme.secondaryTextColor }]}>
          {item.category}
        </Text>
        <Text style={[styles.appDetails, { color: theme.secondaryTextColor }]}>
          {item.size} • Esperando descarga
        </Text>
      </View>
      <TouchableOpacity style={styles.downloadButton}>
        <Ionicons name="download" size={20} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );

  const renderApp = ({ item }) => {
    switch (item.status) {
      case "completed":
        return renderDownloadedApp({ item });
      case "downloading":
        return renderDownloadingApp({ item });
      case "pending":
        return renderPendingApp({ item });
      default:
        return null;
    }
  };

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
          {getText("downloads")}
        </Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={theme.textColor} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View
        style={[
          styles.tabContainer,
          { backgroundColor: theme.backgroundColor },
        ]}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && { backgroundColor: theme.primary },
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text
              style={[
                styles.tabText,
                { color: theme.textColor },
                activeTab === tab.id && { color: "#fff" },
              ]}
            >
              {tab.title}
            </Text>
            {tab.count > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{tab.count}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Storage Info */}
      <View
        style={[styles.storageInfo, { backgroundColor: theme.cardBackground }]}
      >
        <View style={styles.storageLeft}>
          <Ionicons
            name="phone-portrait"
            size={20}
            color={theme.secondaryTextColor}
          />
          <Text
            style={[styles.storageText, { color: theme.secondaryTextColor }]}
          >
            {getText("spaceUsed")}: 2.4 GB de 64 GB disponibles
          </Text>
        </View>
        <TouchableOpacity>
          <Text style={[styles.manageStorage, { color: theme.primary }]}>
            {getText("manage")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Apps List */}
      <FlatList
        data={getCurrentData()}
        renderItem={renderApp}
        keyExtractor={(item) => item.id}
        style={styles.appsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="download-outline" size={80} color="#ccc" />
            <Text style={[styles.emptyTitle, { color: theme.textColor }]}>
              {activeTab === "downloaded" && getText("noDownloads")}
              {activeTab === "downloading" && getText("noDownloading")}
              {activeTab === "pending" && getText("noPending")}
            </Text>
            <Text
              style={[
                styles.emptySubtitle,
                { color: theme.secondaryTextColor },
              ]}
            >
              {getText("downloadsAppearHere")}
            </Text>
          </View>
        )}
      />

      {/* Bottom Actions */}
      {getCurrentData().length > 0 && (
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>
              {activeTab === "downloaded" && "Limpiar historial"}
              {activeTab === "downloading" && "Pausar todo"}
              {activeTab === "pending" && "Descargar todo"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
  settingsButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingHorizontal: 5,
    paddingBottom: 10,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 5,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#8E44AD",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "white",
  },
  tabBadge: {
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 5,
  },
  tabBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  storageInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 10,
  },
  storageLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  storageText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#666",
  },
  manageStorage: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
  appsList: {
    flex: 1,
    marginTop: 10,
  },
  appItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 1,
  },
  appIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  appCategory: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  appDetails: {
    fontSize: 12,
    color: "#999",
    marginBottom: 2,
  },
  appVersion: {
    fontSize: 12,
    color: "#999",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    marginRight: 10,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: "#666",
    width: 30,
  },
  actionButton: {
    padding: 8,
  },
  pauseButton: {
    padding: 8,
  },
  downloadButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },
  bottomActions: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  actionButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
    textAlign: "center",
  },
});
