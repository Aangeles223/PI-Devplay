import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { UserContext } from "../context/UserContext";
import { getMisApps } from "../services/api";

export default function PurchasesScreen({ navigation }) {
  const { theme, getText } = useTheme();
  const [activeFilter, setActiveFilter] = useState("all");
  const [ownedApps, setOwnedApps] = useState([]);
  const { usuario } = useContext(UserContext);
  // Fetch owned apps when user is set
  useEffect(() => {
    const loadOwnedApps = () => {
      console.log("PurchasesScreen - User data:", usuario);
      console.log("PurchasesScreen - User ID:", usuario?.id);

      if (!usuario?.id) {
        console.log("PurchasesScreen - No user ID found, skipping getMisApps");
        return;
      }

      getMisApps(usuario.id)
        .then((res) => {
          console.log("PurchasesScreen - getMisApps response:", res.data);
          // Eliminar duplicados basados en id_app
          const uniqueApps = res.data.filter(
            (app, index, self) =>
              index === self.findIndex((a) => a.id_app === app.id_app)
          );
          setOwnedApps(uniqueApps);
        })
        .catch((e) => {
          console.error("PurchasesScreen - Error loading owned apps:", e);
          console.error("Error details:", e.response?.data || e.message);
        });
    };

    loadOwnedApps();

    // Recargar cuando regresemos a esta pantalla (si navigation existe)
    const unsubscribe = navigation?.addListener?.("focus", loadOwnedApps);
    return () => unsubscribe?.();
  }, [usuario, navigation]);
  // Combine downloads with app info
  // Map ownedApps to purchase items
  const purchases = ownedApps.map((appItem) => {
    const priceNum = parseFloat(appItem.price) || 0;
    const type = priceNum > 0 ? "paid" : "free";
    return {
      id: appItem.id_app.toString(),
      name: appItem.name,
      category: appItem.category || "",
      price:
        type === "paid"
          ? `$${priceNum.toFixed(2)}`
          : getText("free") || "Gratis",
      purchaseDate: "", // fecha not stored in mis_apps
      type,
      icon: appItem.icon || "", // use icon from API
      status: "owned",
      orderNumber: "",
    };
  });

  console.log("PurchasesScreen - Mapped purchases:", purchases.length, "items");
  console.log("PurchasesScreen - First few purchases:", purchases.slice(0, 3));

  const filters = [
    { id: "all", title: getText("all"), count: purchases.length },
    {
      id: "paid",
      title: getText("paid"),
      count: purchases.filter((p) => p.type === "paid").length,
    },
    {
      id: "free",
      title: getText("free"),
      count: purchases.filter((p) => p.type === "free").length,
    },
  ];

  const getFilteredPurchases = () => {
    switch (activeFilter) {
      case "paid":
        return purchases.filter((p) => p.type === "paid");
      case "free":
        return purchases.filter((p) => p.type === "free");
      default:
        return purchases;
    }
  };

  const getTotalSpent = () => {
    return purchases
      .filter((p) => p.type === "paid" && p.status === "owned")
      .reduce((total, purchase) => {
        const price = parseFloat(purchase.price.replace("$", ""));
        return total + price;
      }, 0)
      .toFixed(2);
  };

  const renderPurchase = ({ item }) => (
    <TouchableOpacity
      style={[styles.purchaseItem, { backgroundColor: theme.cardBackground }]}
    >
      <View style={styles.purchaseIcon}>
        <Ionicons name={item.icon} size={40} color={theme.primary} />
      </View>
      <View style={styles.purchaseInfo}>
        <Text style={[styles.purchaseName, { color: theme.textColor }]}>
          {item.name}
        </Text>
        <Text
          style={[styles.purchaseCategory, { color: theme.secondaryTextColor }]}
        >
          {item.category}
        </Text>
        <Text
          style={[styles.purchaseDate, { color: theme.secondaryTextColor }]}
        >
          {item.purchaseDate}
        </Text>
        <Text style={[styles.orderNumber, { color: theme.secondaryTextColor }]}>
          Orden: {item.orderNumber}
        </Text>
      </View>
      <View style={styles.purchaseRight}>
        <Text
          style={[
            styles.purchasePrice,
            { color: theme.textColor },
            item.type === "free" && { color: theme.primary },
          ]}
        >
          {item.price}
        </Text>
        <View style={styles.statusContainer}>
          {item.status === "owned" && (
            <View style={styles.statusBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#34C759" />
              <Text
                style={[styles.statusText, { color: theme.secondaryTextColor }]}
              >
                Poseído
              </Text>
            </View>
          )}
          {item.status === "refunded" && (
            <View style={[styles.statusBadge, styles.refundedBadge]}>
              <Ionicons name="return-up-back" size={16} color="#FF9500" />
              <Text
                style={[
                  styles.statusText,
                  styles.refundedText,
                  { color: theme.secondaryTextColor },
                ]}
              >
                Reembolsado
              </Text>
            </View>
          )}
        </View>
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
          {getText("myPurchases")}
        </Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color={theme.textColor} />
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View
        style={[
          styles.summaryContainer,
          { backgroundColor: theme.backgroundColor },
        ]}
      >
        <View
          style={[
            styles.summaryCard,
            { backgroundColor: theme.cardBackground },
          ]}
        >
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: theme.textColor }]}>
              {purchases.length}
            </Text>
            <Text
              style={[styles.summaryLabel, { color: theme.secondaryTextColor }]}
            >
              {getText("totalApps")}
            </Text>
          </View>
          <View
            style={[styles.summaryDivider, { backgroundColor: theme.border }]}
          />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: theme.textColor }]}>
              ${getTotalSpent()}
            </Text>
            <Text
              style={[styles.summaryLabel, { color: theme.secondaryTextColor }]}
            >
              {getText("totalSpent")}
            </Text>
          </View>
          <View
            style={[styles.summaryDivider, { backgroundColor: theme.border }]}
          />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: theme.textColor }]}>
              {purchases.filter((p) => p.type === "free").length}
            </Text>
            <Text
              style={[styles.summaryLabel, { color: theme.secondaryTextColor }]}
            >
              {getText("freeApps")}
            </Text>
          </View>
        </View>
      </View>

      {/* Filters */}
      <View
        style={[
          styles.filterContainer,
          { backgroundColor: theme.backgroundColor },
        ]}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterButton,
              {
                backgroundColor:
                  activeFilter === filter.id
                    ? theme.primary
                    : theme.cardBackground,
              },
            ]}
            onPress={() => setActiveFilter(filter.id)}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color: activeFilter === filter.id ? "#fff" : theme.textColor,
                },
              ]}
            >
              {filter.title}
            </Text>
            {filter.count > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{filter.count}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Purchases List */}
      <FlatList
        data={getFilteredPurchases()}
        renderItem={renderPurchase}
        keyExtractor={(item) => item.id}
        style={styles.purchasesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons
              name="bag-outline"
              size={80}
              color={theme.secondaryTextColor}
            />
            <Text style={[styles.emptyTitle, { color: theme.textColor }]}>
              {activeFilter === "paid" && getText("noPaidPurchases")}
              {activeFilter === "free" && getText("noFreeApps")}
              {activeFilter === "all" && getText("noPurchases")}
            </Text>
            <Text
              style={[
                styles.emptySubtitle,
                { color: theme.secondaryTextColor },
              ]}
            >
              {getText("purchasesHistoryMessage")}
            </Text>
          </View>
        )}
      />

      {/* Bottom Info */}
      <View style={[styles.bottomInfo, { borderTopColor: theme.border }]}>
        <TouchableOpacity style={styles.infoButton}>
          <Ionicons
            name="help-circle-outline"
            size={20}
            color={theme.primary}
          />
          <Text style={[styles.infoButtonText, { color: theme.primary }]}>
            {getText("needPurchaseHelp")}
          </Text>
        </TouchableOpacity>
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
  searchButton: {
    padding: 8,
  },
  summaryContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
  },
  summaryCard: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 20,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#8E44AD",
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  summaryDivider: {
    width: 1,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 15,
  },
  filterContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 10,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  activeFilter: {
    backgroundColor: "#8E44AD",
  },
  filterText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  activeFilterText: {
    color: "white",
  },
  filterBadge: {
    backgroundColor: "#666",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 5,
  },
  filterBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  purchasesList: {
    flex: 1,
    marginTop: 10,
  },
  purchaseItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 1,
  },
  purchaseIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  purchaseInfo: {
    flex: 1,
  },
  purchaseName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  purchaseCategory: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  purchaseDate: {
    fontSize: 12,
    color: "#999",
    marginBottom: 2,
  },
  orderNumber: {
    fontSize: 10,
    color: "#ccc",
  },
  purchaseRight: {
    alignItems: "flex-end",
  },
  purchasePrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  freePrice: {
    color: "#34C759",
  },
  statusContainer: {
    alignItems: "flex-end",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E8",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  refundedBadge: {
    backgroundColor: "#FFF4E6",
  },
  statusText: {
    fontSize: 12,
    color: "#34C759",
    marginLeft: 4,
    fontWeight: "500",
  },
  refundedText: {
    color: "#FF9500",
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
  bottomInfo: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  infoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  infoButtonText: {
    fontSize: 16,
    color: "#007AFF",
    marginLeft: 8,
    fontWeight: "500",
  },
});
