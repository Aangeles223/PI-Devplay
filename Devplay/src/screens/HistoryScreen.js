import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function HistoryScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("search");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock search history data
  const searchHistory = [
    {
      id: "1",
      query: "instagram",
      timestamp: "2024-01-15 14:30",
      results: 12,
      type: "search",
    },
    {
      id: "2",
      query: "juegos gratis",
      timestamp: "2024-01-15 12:15",
      results: 45,
      type: "search",
    },
    {
      id: "3",
      query: "netflix",
      timestamp: "2024-01-14 18:45",
      results: 3,
      type: "search",
    },
    {
      id: "4",
      query: "editores de video",
      timestamp: "2024-01-14 16:20",
      results: 28,
      type: "search",
    },
    {
      id: "5",
      query: "whatsapp",
      timestamp: "2024-01-13 11:10",
      results: 8,
      type: "search",
    },
  ];

  // Mock viewed apps history
  const viewHistory = [
    {
      id: "1",
      appName: "Instagram",
      category: "Redes sociales",
      timestamp: "2024-01-15 14:32",
      icon: "logo-instagram",
      action: "viewed",
    },
    {
      id: "2",
      appName: "TikTok",
      category: "Entretenimiento",
      timestamp: "2024-01-15 12:20",
      icon: "musical-note",
      action: "downloaded",
    },
    {
      id: "3",
      appName: "Netflix",
      category: "Entretenimiento",
      timestamp: "2024-01-14 18:47",
      icon: "play-circle",
      action: "viewed",
    },
    {
      id: "4",
      appName: "Adobe Premiere Rush",
      category: "Fotografía y video",
      timestamp: "2024-01-14 16:25",
      icon: "videocam",
      action: "viewed",
    },
    {
      id: "5",
      appName: "WhatsApp",
      category: "Comunicación",
      timestamp: "2024-01-13 11:12",
      icon: "logo-whatsapp",
      action: "downloaded",
    },
  ];

  const tabs = [
    {
      id: "search",
      title: "Búsquedas",
      count: searchHistory.length,
      icon: "search",
    },
    {
      id: "apps",
      title: "Apps Vistas",
      count: viewHistory.length,
      icon: "eye",
    },
  ];

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Hoy a las ${date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Ayer a las ${date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else {
      return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const getFilteredData = () => {
    const data = activeTab === "search" ? searchHistory : viewHistory;
    if (!searchQuery) return data;

    return data.filter((item) => {
      const searchText = activeTab === "search" ? item.query : item.appName;
      return searchText.toLowerCase().includes(searchQuery.toLowerCase());
    });
  };

  const clearHistory = () => {
    console.log(`Clearing ${activeTab} history`);
  };

  const removeItem = (itemId) => {
    console.log(`Removing item ${itemId} from ${activeTab} history`);
  };

  const renderSearchItem = ({ item }) => (
    <TouchableOpacity style={styles.historyItem}>
      <View style={styles.itemLeft}>
        <View style={styles.itemIcon}>
          <Ionicons name="search" size={20} color="#666" />
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle}>{item.query}</Text>
          <Text style={styles.itemSubtitle}>
            {item.results} resultado{item.results !== 1 ? "s" : ""} •{" "}
            {formatDate(item.timestamp)}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeItem(item.id)}
      >
        <Ionicons name="close" size={18} color="#666" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderAppItem = ({ item }) => (
    <TouchableOpacity style={styles.historyItem}>
      <View style={styles.itemLeft}>
        <View style={styles.appIcon}>
          <Ionicons name={item.icon} size={24} color="#8E44AD" />
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle}>{item.appName}</Text>
          <Text style={styles.itemSubtitle}>
            {item.category} • {formatDate(item.timestamp)}
          </Text>
        </View>
      </View>
      <View style={styles.itemRight}>
        <View
          style={[
            styles.actionBadge,
            item.action === "downloaded" && styles.downloadedBadge,
          ]}
        >
          <Ionicons
            name={item.action === "downloaded" ? "download" : "eye"}
            size={12}
            color={item.action === "downloaded" ? "#34C759" : "#007AFF"}
          />
          <Text
            style={[
              styles.actionText,
              item.action === "downloaded" && styles.downloadedText,
            ]}
          >
            {item.action === "downloaded" ? "Descargada" : "Vista"}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeItem(item.id)}
        >
          <Ionicons name="close" size={18} color="#666" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historial</Text>
        <TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
          <Text style={styles.clearButtonText}>Limpiar</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons
              name={tab.icon}
              size={18}
              color={activeTab === tab.id ? "white" : "#666"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText,
              ]}
            >
              {tab.title}
            </Text>
            {tab.count > 0 && (
              <View
                style={[
                  styles.tabBadge,
                  activeTab === tab.id && styles.activeTabBadge,
                ]}
              >
                <Text
                  style={[
                    styles.tabBadgeText,
                    activeTab === tab.id && styles.activeTabBadgeText,
                  ]}
                >
                  {tab.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder={`Buscar en ${
              activeTab === "search" ? "búsquedas" : "apps vistas"
            }...`}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>
            {activeTab === "search"
              ? "Actividad de Búsqueda"
              : "Actividad de Navegación"}
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {activeTab === "search"
                  ? searchHistory.length
                  : viewHistory.length}
              </Text>
              <Text style={styles.statLabel}>
                {activeTab === "search" ? "Búsquedas" : "Apps vistas"}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>7</Text>
              <Text style={styles.statLabel}>Días activos</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {activeTab === "search" ? "2.4" : "4.2"}
              </Text>
              <Text style={styles.statLabel}>
                {activeTab === "search" ? "Por día" : "Por día"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* History List */}
      <FlatList
        data={getFilteredData()}
        renderItem={activeTab === "search" ? renderSearchItem : renderAppItem}
        keyExtractor={(item) => item.id}
        style={styles.historyList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons
              name={activeTab === "search" ? "search" : "eye-outline"}
              size={80}
              color="#ccc"
            />
            <Text style={styles.emptyTitle}>
              {searchQuery
                ? "No se encontraron resultados"
                : activeTab === "search"
                ? "No hay búsquedas recientes"
                : "No hay apps vistas"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? "Intenta con otros términos de búsqueda"
                : activeTab === "search"
                ? "Tus búsquedas aparecerán aquí"
                : "Las apps que veas aparecerán aquí"}
            </Text>
          </View>
        )}
      />

      {/* Privacy Notice */}
      <View style={styles.privacyNotice}>
        <Ionicons name="shield-checkmark-outline" size={16} color="#007AFF" />
        <Text style={styles.privacyText}>
          Tu historial se almacena localmente y puedes eliminarlo en cualquier
          momento
        </Text>
      </View>
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
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    fontSize: 16,
    color: "#FF3B30",
    fontWeight: "500",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingBottom: 15,
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
    backgroundColor: "#f0f0f0",
  },
  activeTab: {
    backgroundColor: "#8E44AD",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    marginLeft: 6,
  },
  activeTabText: {
    color: "white",
  },
  tabBadge: {
    backgroundColor: "#666",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  activeTabBadge: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  tabBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  activeTabBadgeText: {
    color: "white",
  },
  searchContainer: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    color: "#333",
  },
  statsContainer: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 10,
  },
  statsCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 15,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#8E44AD",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 15,
  },
  historyList: {
    flex: 1,
    marginTop: 10,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 1,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  appIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  itemRight: {
    alignItems: "flex-end",
  },
  actionBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 5,
  },
  downloadedBadge: {
    backgroundColor: "#E8F5E8",
  },
  actionText: {
    fontSize: 12,
    color: "#007AFF",
    marginLeft: 4,
    fontWeight: "500",
  },
  downloadedText: {
    color: "#34C759",
  },
  removeButton: {
    padding: 4,
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
  privacyNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  privacyText: {
    flex: 1,
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
    lineHeight: 16,
  },
});
