import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function AppCard({
  app,
  price,
  onPress,
  onInstall,
  installLabel,
  installDisabled,
}) {
  const { theme } = useTheme();
  // Validación: solo mostrar botón si el usuario está logueado y el app tiene id válido
  const isInstallEnabled = onInstall && app?.id && !installDisabled;
  return (
    <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
      <TouchableOpacity
        onPress={onPress}
        style={styles.cardTouchable}
        activeOpacity={0.8}
        hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
      >
        <Image
          source={
            app.icon ? { uri: app.icon } : require("../../assets/icon.png")
          }
          style={styles.icon}
        />
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

      {/* Botón de instalar separado del TouchableOpacity principal */}
      <View style={styles.buttonContainer}>
        {isInstallEnabled ? (
          <TouchableOpacity
            style={[
              styles.installButtonMobile,
              installDisabled && { backgroundColor: "#ccc" },
            ]}
            onPress={onInstall}
            disabled={installDisabled}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.installButtonTextMobile}>
              {installLabel || "Instalar"}
            </Text>
          </TouchableOpacity>
        ) : (
          <Text
            style={{ color: "#FF6B6B", marginTop: 12, textAlign: "center" }}
          >
            Inicia sesión para instalar
          </Text>
        )}
      </View>
    </View>
  );
  // ...existing code...
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "column",
    marginVertical: 8,
    padding: 12,
    borderRadius: 12,
  },
  cardTouchable: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
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
  buttonContainer: {
    marginTop: 12,
    alignItems: "center",
  },
  installButtonMobile: {
    backgroundColor: "#FF6B6B",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 26,
    minWidth: 130,
    minHeight: 44,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  installButtonTextMobile: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
});
