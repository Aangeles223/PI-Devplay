import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import Constants from "expo-constants";

export default function DownloadsScreen({ navigation }) {
  const { theme, getText } = useTheme();
  const [activeTab, setActiveTab] = useState("downloaded");

  // Host for API: emulator vs device
  // Host for API: emulator vs device
  // Host for API: derive dev server IP dynamically
  // Host for API: Android emulator or development machine on LAN
  const host =
    Platform.OS === "android"
      ? "http://10.0.2.2:3001"
      : "http://10.0.0.11:3001"; // Reemplaza 10.0.0.11 con la IP de tu PC en la LAN
  // Fetch all apps for mapping downloads
  const [backendApps, setBackendApps] = useState([]);
  useEffect(() => {
    console.log("DownloadsScreen using API host:", host);
    fetch(`${host}/apps`)
      .then((res) => res.json())
      .then((data) => setBackendApps(data))
      .catch(console.error);
  }, [host]);

  // Real data for downloaded apps
  const [downloadedApps, setDownloadedApps] = useState([]);
  // Downloading apps state (simulate progress)
  const [downloadingApps, setDownloadingApps] = useState([]);
  // Timers for download simulation
  const downloadTimers = useRef({});
  // Timeout timers for download completion
  const timeoutTimers = useRef({});

  // Pending apps: those in backendApps not yet downloaded or downloading
  const pendingApps = backendApps
    .filter(
      (a) =>
        !downloadedApps?.some((d) => d.appId === a.id) &&
        !downloadingApps?.some((d) => d.id === a.id)
    )
    .map((a) => ({ ...a, status: "pending" }));
  // Tabs based on downloadedApps
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
    if (activeTab === "downloaded")
      return downloadedApps.filter((d) => d.status === "completed");
    if (activeTab === "downloading") return downloadingApps;
    if (activeTab === "pending") return pendingApps;
    return [];
  };
  // Load downloads from backend
  const loadDownloads = () => {
    fetch(`${host}/descargas`)
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.map((d) => {
          const appInfo = backendApps.find((a) => a.id === d.id_app) || {};
          return {
            ...appInfo,
            downloadId: d.id_descarga,
            appId: d.id_app,
            downloadDate: d.fecha,
            status: "completed",
          };
        });
        setDownloadedApps(mapped);
      })
      .catch(console.error);
  };
  useEffect(() => {
    loadDownloads();
  }, [host, backendApps]);

  const handleStartDownload = (app) => {
    // Notify download start
    alert(`${getText("downloading") || "Descargando"}: ${app.name}`);
    // add to downloading list and switch to downloading tab
    setDownloadingApps((prev) => [
      ...prev,
      { ...app, progress: 0, status: "downloading" },
    ]);
    setActiveTab("downloading");
    // tick every second
    const interval = setInterval(() => {
      setDownloadingApps((prev) =>
        prev.map((d) =>
          d.id === app.id
            ? { ...d, progress: Math.min(d.progress + 100 / 240, 100) }
            : d
        )
      );
    }, 1000);
    downloadTimers.current[app.id] = interval;
    // finish after 4 minutes
    const timeoutId = setTimeout(() => {
      clearInterval(downloadTimers.current[app.id]);
      setDownloadingApps((prev) => prev.filter((d) => d.id !== app.id));
      // Notify download completion
      alert(`${app.name} ${getText("downloadComplete") || "instalado"}`);
      // record download in backend
      fetch(`${host}/descargas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_app: app.id }),
      })
        .then((res) => res.json())
        .then(() => loadDownloads())
        .catch(console.error);
    }, 240000);
    timeoutTimers.current[app.id] = timeoutId;
    timeoutTimers.current[app.id] = timeoutId;
  };
  // Uninstall downloaded app
  const handleUninstall = (downloadId) => {
    fetch(`${host}/descargas/${downloadId}`, { method: "DELETE" })
      .then((res) => res.json())
      .then(() => loadDownloads())
      .catch(console.error);
  };

  // Upon unmount, clear all timers to avoid state updates
  useEffect(() => {
    return () => {
      // Clear all download intervals
      Object.values(downloadTimers.current).forEach((id) => clearInterval(id));
      // Clear all completion timeouts
      Object.values(timeoutTimers.current).forEach((id) => clearTimeout(id));
    };
  }, []);

  const renderDownloadedApp = ({ item }) => (
    <View style={[styles.appItem, { backgroundColor: theme.cardBackground }]}>
      <View style={styles.appIcon}>
        {item.icon ? (
          <Image
            source={{ uri: item.icon }}
            style={{ width: 40, height: 40, borderRadius: 8 }}
          />
        ) : (
          <Ionicons name="alert-circle" size={40} color="#ccc" />
        )}
      </View>
      <View style={styles.appInfo}>
        <Text style={[styles.appName, { color: theme.textColor }]}>
          {item.name}
        </Text>
        <Text style={[styles.appCategory, { color: theme.secondaryTextColor }]}>
          {item.category}
        </Text>
        <Text style={[styles.appDetails, { color: theme.secondaryTextColor }]}>
          {item.size} • {new Date(item.downloadDate).toLocaleDateString()}
        </Text>
        <Text style={[styles.appVersion, { color: theme.secondaryTextColor }]}>
          Versión {item.version}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.downloadButton}
        onPress={() => handleUninstall(item.downloadId)}
      >
        <Text style={{ color: "#FF3B30", fontWeight: "600" }}>
          {getText("uninstall") || "Desinstalar"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderDownloadingApp = ({ item }) => (
    <View style={[styles.appItem, { backgroundColor: theme.cardBackground }]}>
      <View style={styles.appIcon}>
        {item.icon ? (
          <Image
            source={{ uri: item.icon }}
            style={{ width: 40, height: 40, borderRadius: 8 }}
          />
        ) : (
          <Ionicons name="alert-circle" size={40} color="#ccc" />
        )}
      </View>
      <View style={styles.appInfo}>
        <Text style={[styles.appName, { color: theme.textColor }]}>
          {item.name}
        </Text>
        <Text style={[styles.appCategory, { color: theme.secondaryTextColor }]}>
          {item.category}
        </Text>
        <Text style={[styles.appDetails, { color: theme.secondaryTextColor }]}>
          {`${Math.round(item.progress)}% de ${item.size}`}
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
        </View>
        <Text
          style={[styles.progressText, { color: theme.secondaryTextColor }]}
        >
          {`${Math.round(item.progress)}%`}
        </Text>
      </View>
      <TouchableOpacity style={styles.pauseButton}>
        <Ionicons name="pause" size={20} color={theme.secondaryTextColor} />
      </TouchableOpacity>
    </View>
  );

  const renderPendingApp = ({ item }) => (
    <View style={[styles.appItem, { backgroundColor: theme.cardBackground }]}>
      <View style={styles.appIcon}>
        {item.icon ? (
          <Image
            source={{ uri: item.icon }}
            style={{ width: 40, height: 40, borderRadius: 8 }}
          />
        ) : (
          <Ionicons name="alert-circle" size={40} color="#ccc" />
        )}
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
      <TouchableOpacity
        style={styles.downloadButton}
        onPress={() => handleStartDownload(item)}
      >
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
        // use downloadId for completed downloads or id otherwise to ensure unique keys
        keyExtractor={(item) =>
          (item.downloadId != null ? item.downloadId : item.id).toString()
        }
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
