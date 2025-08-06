import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function Section({
  title,
  data,
  renderItem,
  horizontal = false,
  onSeeMore,
}) {
  const { theme, getText } = useTheme();
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textColor }]}>
          {getText(title) || title}
        </Text>
        {onSeeMore && (
          <TouchableOpacity onPress={() => onSeeMore(title, data)}>
            <Text style={[styles.seeMore, { color: theme.primary }]}>
              {getText("seeMore") || "Ver más"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={data}
        horizontal={horizontal}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={horizontal ? styles.listHorizontal : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  title: { fontSize: 18, fontWeight: "bold" },
  seeMore: { fontSize: 14, fontWeight: "500" },
  listHorizontal: { paddingHorizontal: 16 },
});
