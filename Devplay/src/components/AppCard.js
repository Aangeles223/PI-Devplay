import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function AppCard({ app, price }) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.cardBackground }]}
    >
      <Image source={app.icon} style={styles.icon} />
      <View style={styles.info}>
        <Text
          style={[styles.name, { color: theme.textColor }]}
          numberOfLines={1}
        >
          {app.name}
        </Text>
        <Text style={[styles.price, { color: theme.textSecondary }]}>
          {price}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    padding: 12,
    borderRadius: 12,
  },
  icon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  price: {
    fontSize: 14,
    marginTop: 4,
  },
});
