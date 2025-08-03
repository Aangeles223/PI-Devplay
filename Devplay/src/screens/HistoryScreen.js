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
import { useTheme } from "../context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HistoryScreen({ navigation }) {
  const { theme, getText } = useTheme();
  const [activeTab, setActiveTab] = useState("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState([]);
  const [viewHistory, setViewHistory] = useState([]);

  // Load persisted history on focus
  useFocusEffect(
    React.useCallback(() => {
      async function loadHistory() {
        try {
          const s = await AsyncStorage.getItem("searchHistory");
          const v = await AsyncStorage.getItem("viewHistory");
          const sArr = s ? JSON.parse(s) : [];
          const vArr = v ? JSON.parse(v) : [];
          // Map queries to items
          setSearchHistory(
            sArr.map((q, idx) => ({
              id: idx.toString(),
              query: q,
              timestamp: "",
              results: 0,
              type: "search",
            }))
          );
          setViewHistory(vArr);
        } catch (e) {
          console.warn("Error loading history", e);
        }
      }
      loadHistory();
    }, [])
  );

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `${getText("today")} ${date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `${getText("yesterday")} ${date.toLocaleTimeString("es-ES", {
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

  const clearHistory = async () => {
    try {
      if (activeTab === "search") {
        await AsyncStorage.removeItem("searchHistory");
        setSearchHistory([]);
      } else {
        await AsyncStorage.removeItem("viewHistory");
        setViewHistory([]);
      }
    } catch (e) {
      console.warn("Error clearing history", e);
    }
  };

  const removeItem = async (itemId) => {
    try {
      if (activeTab === "search") {
        const filtered = searchHistory.filter((item) => item.id !== itemId);
        await AsyncStorage.setItem(
          "searchHistory",
          JSON.stringify(filtered.map((i) => i.query))
        );
        setSearchHistory(filtered);
      } else {
        const filtered = viewHistory.filter((item) => item.id !== itemId);
        await AsyncStorage.setItem("viewHistory", JSON.stringify(filtered));
        setViewHistory(filtered);
      }
    } catch (e) {
      console.warn("Error removing history item", e);
    }
  };

  const renderSearchItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.historyItem, { backgroundColor: theme.cardBackground }]}
    >
      <View style={styles.itemLeft}>
        <View style={styles.itemIcon}>
          <Ionicons name="search" size={20} color={theme.secondaryTextColor} />
        </View>
        <View style={styles.itemInfo}>
          <Text style={[styles.itemTitle, { color: theme.textColor }]}>
            {item.query}
          </Text>
          <Text
            style={[styles.itemSubtitle, { color: theme.secondaryTextColor }]}
          >
            {item.results}{" "}
            {item.results !== 1 ? getText("resultsPlural") : getText("results")}{" "}
            • {formatDate(item.timestamp)}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeItem(item.id)}
      >
        <Ionicons name="close" size={18} color={theme.secondaryTextColor} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderAppItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.historyItem, { backgroundColor: theme.cardBackground }]}
    >
      <View style={styles.itemLeft}>
        <View style={styles.appIcon}>
          <Ionicons name={item.icon} size={24} color={theme.primary} />
        </View>
        <View style={styles.itemInfo}>
          <Text style={[styles.itemTitle, { color: theme.textColor }]}>
            {item.appName}
          </Text>
          <Text
            style={[styles.itemSubtitle, { color: theme.secondaryTextColor }]}
          >
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
              { color: theme.secondaryTextColor },
              item.action === "downloaded" && { color: theme.primary },
            ]}
          >
            {item.action === "downloaded"
              ? getText("downloaded")
              : getText("viewed")}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeItem(item.id)}
        >
          <Ionicons name="close" size={18} color={theme.secondaryTextColor} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

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
          {getText("history")}
        </Text>
        <TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
          <Text style={[styles.clearButtonText, { color: theme.primary }]}>
            {getText("clear")}
          </Text>
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
              {
                backgroundColor:
                  activeTab === tab.id ? theme.primary : theme.cardBackground,
              },
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons
              name={tab.icon}
              size={18}
              color={activeTab === tab.id ? "white" : theme.secondaryTextColor}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === tab.id ? "white" : theme.textColor },
              ]}
            >
              {getText(tab.titleKey)}
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
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: theme.backgroundColor },
        ]}
      >
        <View
          style={[styles.searchBox, { backgroundColor: theme.cardBackground }]}
        >
          <Ionicons name="search" size={20} color={theme.secondaryTextColor} />
          <TextInput
            style={[styles.searchInput, { color: theme.textColor }]}
            placeholder={`${getText("searchHistory")}`}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={theme.secondaryTextColor}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={theme.secondaryTextColor}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Statistics */}
      <View style={styles.statsContainer}>
        <View
          style={[styles.statsCard, { backgroundColor: theme.cardBackground }]}
        >
          <Text style={[styles.statsTitle, { color: theme.textColor }]}>
            {activeTab === "search"
              ? getText("searchActivity")
              : getText("browsingActivity")}
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.textColor }]}>
                {activeTab === "search"
                  ? searchHistory.length
                  : viewHistory.length}
              </Text>
              <Text
                style={[styles.statLabel, { color: theme.secondaryTextColor }]}
              >
                {activeTab === "search"
                  ? getText("searches")
                  : getText("appsViewed")}
              </Text>
            </View>
            <View
              style={[styles.statDivider, { backgroundColor: theme.border }]}
            />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.textColor }]}>
                7
              </Text>
              <Text
                style={[styles.statLabel, { color: theme.secondaryTextColor }]}
              >
                {getText("activeDays")}
              </Text>
            </View>
            <View
              style={[styles.statDivider, { backgroundColor: theme.border }]}
            />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.textColor }]}>
                {activeTab === "search" ? "2.4" : "4.2"}
              </Text>
              <Text
                style={[styles.statLabel, { color: theme.secondaryTextColor }]}
              >
                {getText("perDay")}
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
              color={theme.secondaryTextColor}
            />
            <Text style={[styles.emptyTitle, { color: theme.textColor }]}>
              {searchQuery
                ? getText("noSearchResults")
                : activeTab === "search"
                ? getText("noRecentSearches")
                : getText("noAppsViewed")}
            </Text>
            <Text
              style={[
                styles.emptySubtitle,
                { color: theme.secondaryTextColor },
              ]}
            >
              {searchQuery
                ? getText("tryOtherTerms")
                : activeTab === "search"
                ? getText("searchesAppearHere")
                : getText("appsAppearHere")}
            </Text>
          </View>
        )}
      />

      {/* Privacy Notice */}
      <View
        style={[
          styles.privacyNotice,
          { backgroundColor: theme.backgroundColor },
        ]}
      >
        <Ionicons
          name="shield-checkmark-outline"
          size={16}
          color={theme.primary}
        />
        <Text style={[styles.privacyText, { color: theme.secondaryTextColor }]}>
          {getText("privacyNotice")}
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
