import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PurchasesScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState("all");

  // Mock data for purchases
  const purchases = [
    {
      id: "1",
      name: "Minecraft",
      category: "Juegos",
      price: "$6.99",
      purchaseDate: "15 Ene 2024",
      type: "paid",
      icon: "game-controller",
      status: "owned",
      orderNumber: "GPA.1234-5678-9012",
    },
    {
      id: "2",
      name: "Adobe Photoshop Express",
      category: "Fotografía",
      price: "Gratis",
      purchaseDate: "12 Ene 2024",
      type: "free",
      icon: "image",
      status: "owned",
      orderNumber: "GPA.2345-6789-0123",
    },
    {
      id: "3",
      name: "Procreate",
      category: "Diseño",
      price: "$12.99",
      purchaseDate: "10 Ene 2024",
      type: "paid",
      icon: "brush",
      status: "owned",
      orderNumber: "GPA.3456-7890-1234",
    },
    {
      id: "4",
      name: "WhatsApp",
      category: "Comunicación",
      price: "Gratis",
      purchaseDate: "8 Ene 2024",
      type: "free",
      icon: "chatbubbles",
      status: "owned",
      orderNumber: "GPA.4567-8901-2345",
    },
    {
      id: "5",
      name: "Monument Valley",
      category: "Juegos",
      price: "$3.99",
      purchaseDate: "5 Ene 2024",
      type: "paid",
      icon: "triangle",
      status: "refunded",
      orderNumber: "GPA.5678-9012-3456",
    },
    {
      id: "6",
      name: "Spotify",
      category: "Música",
      price: "Gratis",
      purchaseDate: "3 Ene 2024",
      type: "free",
      icon: "musical-notes",
      status: "owned",
      orderNumber: "GPA.6789-0123-4567",
    },
  ];

  const filters = [
    { id: "all", title: "Todos", count: purchases.length },
    {
      id: "paid",
      title: "Pagadas",
      count: purchases.filter((p) => p.type === "paid").length,
    },
    {
      id: "free",
      title: "Gratuitas",
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
    <TouchableOpacity style={styles.purchaseItem}>
      <View style={styles.purchaseIcon}>
        <Ionicons name={item.icon} size={40} color="#8E44AD" />
      </View>
      <View style={styles.purchaseInfo}>
        <Text style={styles.purchaseName}>{item.name}</Text>
        <Text style={styles.purchaseCategory}>{item.category}</Text>
        <Text style={styles.purchaseDate}>{item.purchaseDate}</Text>
        <Text style={styles.orderNumber}>Orden: {item.orderNumber}</Text>
      </View>
      <View style={styles.purchaseRight}>
        <Text
          style={[
            styles.purchasePrice,
            item.type === "free" && styles.freePrice,
          ]}
        >
          {item.price}
        </Text>
        <View style={styles.statusContainer}>
          {item.status === "owned" && (
            <View style={styles.statusBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#34C759" />
              <Text style={styles.statusText}>Poseído</Text>
            </View>
          )}
          {item.status === "refunded" && (
            <View style={[styles.statusBadge, styles.refundedBadge]}>
              <Ionicons name="return-up-back" size={16} color="#FF9500" />
              <Text style={[styles.statusText, styles.refundedText]}>
                Reembolsado
              </Text>
            </View>
          )}
        </View>
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
        <Text style={styles.headerTitle}>Mis Compras</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{purchases.length}</Text>
            <Text style={styles.summaryLabel}>Total de apps</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>${getTotalSpent()}</Text>
            <Text style={styles.summaryLabel}>Total gastado</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              {purchases.filter((p) => p.type === "free").length}
            </Text>
            <Text style={styles.summaryLabel}>Apps gratuitas</Text>
          </View>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterButton,
              activeFilter === filter.id && styles.activeFilter,
            ]}
            onPress={() => setActiveFilter(filter.id)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === filter.id && styles.activeFilterText,
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
            <Ionicons name="bag-outline" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>
              {activeFilter === "paid" && "No tienes compras pagadas"}
              {activeFilter === "free" && "No tienes apps gratuitas"}
              {activeFilter === "all" && "No tienes compras"}
            </Text>
            <Text style={styles.emptySubtitle}>
              Las aplicaciones que descargues aparecerán en tu historial de
              compras
            </Text>
          </View>
        )}
      />

      {/* Bottom Info */}
      <View style={styles.bottomInfo}>
        <TouchableOpacity style={styles.infoButton}>
          <Ionicons name="help-circle-outline" size={20} color="#007AFF" />
          <Text style={styles.infoButtonText}>
            ¿Necesitas ayuda con una compra?
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
