import React, { useState, useEffect, useRef, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Module-level persistent storage for downloads
let persistentDownloadingApps = [];
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
import { UserContext } from "../context/UserContext";
import Constants from "expo-constants";
import {
  postDescarga,
  getMisApps,
  deleteDescarga,
  desinstalarApp,
} from "../services/api";
import Notifications from "../services/notifications";
import { getApps } from "../services/api";

export default function DownloadsScreen({ navigation, route }) {
  // Early return if critical dependencies are missing
  if (!navigation) {
    console.error("Navigation prop missing in DownloadsScreen");
    return null;
  }

  // Request notification permissions
  useEffect(() => {
    const configureNotifications = async () => {
      try {
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== "granted") {
          console.log("Notification permissions not granted");
        }
      } catch (e) {
        console.log("Notifications not available", e);
      }
    };
    configureNotifications();
  }, []);
  const { theme, getText } = useTheme();
  const { usuario } = useContext(UserContext);

  // Early return if theme context is not available
  if (!theme || !getText) {
    console.error("Theme context missing in DownloadsScreen");
    return null;
  }

  const [activeTab, setActiveTab] = useState("downloaded");
  const [installHandled, setInstallHandled] = useState(false);
  const [clearingHistory, setClearingHistory] = useState(false);

  // Fetch app list from backend
  const [backendApps, setBackendApps] = useState([]);
  useEffect(() => {
    getApps()
      .then((res) => setBackendApps(res.data))
      .catch(console.error);
  }, []);

  // Real data for downloaded apps
  const [downloadedApps, setDownloadedApps] = useState([]);
  // Clear previous user's download data when the authenticated user changes
  useEffect(() => {
    if (usuario) {
      console.log("Usuario cambió, limpiando datos anteriores:", usuario.id);
      setDownloadedApps([]);
      setDownloadingApps([]);
      persistentDownloadingApps = [];
      setPendingAppsList([]);
      AsyncStorage.removeItem("downloadingApps");
      AsyncStorage.removeItem("pendingApps");

      // Load downloads for the new user
      setTimeout(() => {
        loadDownloads();
      }, 100);
    }
  }, [usuario?.id, loadDownloads]); // Agregar loadDownloads como dependencia
  // Downloading apps state (simulate progress)
  const [downloadingApps, setDownloadingApps] = useState(
    persistentDownloadingApps
  );
  // Timers for download simulation
  const downloadTimers = useRef({});
  // Timeout timers for download completion
  const timeoutTimers = useRef({});

  // Pending apps: those not yet downloaded or downloading, maintain custom list
  const [pendingAppsList, setPendingAppsList] = useState([]);
  // Flag to initialize pending list only once
  const initialPendingSet = useRef(false);
  // Initialize pendingAppsList once when backendApps first loads
  useEffect(() => {
    if (!initialPendingSet.current && backendApps.length > 0) {
      setPendingAppsList(backendApps);
      initialPendingSet.current = true;
    }
  }, [backendApps]);
  // Compute pending apps by filtering out downloaded and downloading
  const pendingApps = pendingAppsList
    .filter(
      (a) =>
        !downloadedApps?.some((d) => d.id === a.id || d.appId === a.id) &&
        !downloadingApps?.some((d) => d.id === a.id)
    )
    .map((a) => ({ ...a, status: "pending" }));

  // Load downloads from backend
  // Load owned apps from mis_apps endpoint
  const loadDownloads = React.useCallback(() => {
    if (!usuario) {
      console.warn("No hay usuario para cargar descargas");
      setDownloadedApps([]);
      return;
    }

    console.log("Cargando descargas para usuario:", usuario.id);

    getMisApps(usuario.id)
      .then((res) => {
        console.log("Respuesta completa de getMisApps:", res);

        // Validar que la respuesta tenga la estructura esperada
        if (!res || !res.data) {
          console.warn("Respuesta de getMisApps inválida:", res);
          setDownloadedApps([]);
          return;
        }

        console.log("Datos de getMisApps:", res.data);

        // Validar que res.data sea un array
        if (!Array.isArray(res.data)) {
          console.warn("res.data no es un array:", typeof res.data, res.data);
          setDownloadedApps([]);
          return;
        }

        // res.data: array of { id, id_app, name, price, img1, img2, icon, usuario_id }
        const mapped = res.data
          .filter((d) => {
            if (!d || !d.id_app) {
              console.warn("Elemento con datos inválidos filtrado:", d);
              return false;
            }
            return true;
          })
          .map((d) => ({
            id: d.id_app,
            appId: d.id_app, // Agregar appId para el filtrado correcto
            downloadId: d.id,
            name: d.name || "Aplicación sin nombre",
            category: d.category || "Sin categoría",
            size: d.size || "Desconocido",
            version: d.version || "1.0",
            downloadDate: d.fecha_install || new Date().toISOString(),
            icon: d.icon || d.img1 || d.img2,
            status: "completed",
          }));

        console.log("Apps mapeadas:", mapped);
        setDownloadedApps(mapped);
      })
      .catch((error) => {
        console.error("Error cargando descargas:", error);
        console.error("Stack trace:", error.stack);
        setDownloadedApps([]); // Estado fallback
      });
  }, [usuario]);

  const getCurrentData = () => {
    if (activeTab === "downloaded")
      return downloadedApps.filter((d) => d.status === "completed");
    if (activeTab === "downloading") return downloadingApps;
    if (activeTab === "pending") return pendingApps;
    return [];
  };

  // Tabs based on downloadedApps - moved inside component to avoid reference errors
  const tabs = React.useMemo(() => {
    try {
      // Ensure all dependencies are defined
      const downloadedCount = Array.isArray(downloadedApps)
        ? downloadedApps.length
        : 0;
      const downloadingCount = Array.isArray(downloadingApps)
        ? downloadingApps.length
        : 0;
      const pendingCount = Array.isArray(pendingApps) ? pendingApps.length : 0;

      return [
        {
          id: "downloaded",
          title: getText("downloaded") || "Descargadas",
          count: downloadedCount,
        },
        {
          id: "downloading",
          title: getText("downloading") || "Descargando",
          count: downloadingCount,
        },
        {
          id: "pending",
          title: getText("pending") || "Pendientes",
          count: pendingCount,
        },
      ];
    } catch (error) {
      console.error("Error creando tabs:", error);
      return [
        {
          id: "downloaded",
          title: "Descargadas",
          count: 0,
        },
        {
          id: "downloading",
          title: "Descargando",
          count: 0,
        },
        {
          id: "pending",
          title: "Pendientes",
          count: 0,
        },
      ];
    }
  }, [
    downloadedApps?.length || 0,
    downloadingApps?.length || 0,
    pendingApps?.length || 0,
    getText,
  ]);

  // Initialize downloadingApps from storage
  useEffect(() => {
    AsyncStorage.getItem("downloadingApps").then((data) => {
      if (data) {
        try {
          const arr = JSON.parse(data);
          setDownloadingApps(arr);
          persistentDownloadingApps = arr;
          // Resume simulation for stored downloads
          arr.forEach((app) => {
            if (!downloadTimers.current[app.id]) {
              // Progress interval
              const interval = setInterval(() => {
                setDownloadingApps((prev) => {
                  return prev.map((d) =>
                    d.id === app.id
                      ? {
                          ...d,
                          progress: Math.min(d.progress + 100 / 240, 100),
                        }
                      : d
                  );
                });
              }, 1000);
              downloadTimers.current[app.id] = interval;
              // Timeout for completion
              const remaining = ((100 - app.progress) / 100) * 240000;
              const timeoutId = setTimeout(() => {
                clearInterval(downloadTimers.current[app.id]);
                setDownloadingApps((prev) =>
                  prev.filter((d) => d.id !== app.id)
                );
                persistentDownloadingApps = persistentDownloadingApps.filter(
                  (d) => d.id !== app.id
                );
                // Notify
                Notifications.scheduleNotificationAsync({
                  content: {
                    title: getText("downloadComplete") || "Download Complete",
                    body: app.name,
                  },
                  trigger: null,
                }).catch(() => {});
              }, remaining);
              timeoutTimers.current[app.id] = timeoutId;
            }
          });
        } catch {}
      }
    });
  }, []);
  // Persist downloadingApps
  useEffect(() => {
    AsyncStorage.setItem("downloadingApps", JSON.stringify(downloadingApps));
  }, [downloadingApps]);

  // Initialize pendingAppsList from storage
  useEffect(() => {
    AsyncStorage.getItem("pendingApps").then((data) => {
      if (data) {
        try {
          setPendingAppsList(JSON.parse(data));
        } catch {}
      }
    });
  }, []);
  // Persist pendingAppsList
  useEffect(() => {
    AsyncStorage.setItem("pendingApps", JSON.stringify(pendingAppsList));
  }, [pendingAppsList]);

  const handleStartDownload = (app) => {
    console.log("Iniciando descarga para app:", app);

    // Avoid re-downloading installed apps
    if (downloadedApps.some((d) => d.id === app.id)) {
      alert(getText("alreadyInstalled") || "App ya instalada");
      return;
    }

    alert(`${getText("downloading") || "Descargando"}: ${app.name}`);
    setActiveTab("downloading");

    setDownloadingApps((prev) => {
      const updated = [...prev, { ...app, progress: 0, status: "downloading" }];
      persistentDownloadingApps = updated;
      return updated;
    });

    const interval = setInterval(() => {
      setDownloadingApps((prev) => {
        const updated = prev.map((d) =>
          d.id === app.id
            ? { ...d, progress: Math.min(d.progress + 100 / 240, 100) }
            : d
        );
        persistentDownloadingApps = updated;
        return updated;
      });
    }, 1000);
    downloadTimers.current[app.id] = interval;

    // Register download immediately for DB and mis_apps
    if (usuario) {
      console.log("Registrando descarga en BD:", {
        id_app: app.id,
        usuario_id: usuario.id,
      });

      postDescarga({ id_app: app.id, usuario_id: usuario.id })
        .then((response) => {
          console.log("Descarga registrada exitosamente:", response.data);
          loadDownloads();
        })
        .catch((error) => {
          console.error("Error al registrar descarga:", error);
          // Continuar con la descarga simulada aunque falle el registro
        });
    }

    const timeoutId = setTimeout(() => {
      clearInterval(downloadTimers.current[app.id]);
      setDownloadingApps((prev) => {
        const updated = prev.filter((d) => d.id !== app.id);
        persistentDownloadingApps = updated;
        return updated;
      });
      alert(`${app.name} ${getText("downloadComplete") || "instalado"}`);

      // Reload downloads after completion to update UI
      loadDownloads();

      // Schedule local notification for download completion
      Notifications.scheduleNotificationAsync({
        content: {
          title: getText("downloadComplete") || "Download Complete",
          body: app.name,
        },
        trigger: null,
      }).catch(() => {});
    }, 240000);
    timeoutTimers.current[app.id] = timeoutId;
  };
  // If navigated here with installApp param, start download once
  // Start download when installApp param is received
  useEffect(() => {
    const appToInstall = route.params?.installApp;
    if (appToInstall) {
      // remove from pending
      setPendingAppsList((prev) =>
        prev.filter((a) => a.id !== appToInstall.id)
      );
      handleStartDownload(appToInstall);
      // Clear the param to avoid re-triggering
      navigation.setParams({ installApp: undefined });
    }
  }, [route.params?.installApp]);
  // Uninstall downloaded app
  const handleUninstall = (appId, downloadId) => {
    if (!usuario) {
      console.log("No hay usuario para desinstalar");
      return;
    }

    if (!appId) {
      console.error("Error: appId no válido para desinstalar");
      return;
    }

    console.log(
      "Desinstalando app:",
      appId,
      "usuario:",
      usuario.id,
      "downloadId:",
      downloadId
    );

    // Usar la nueva API que elimina de ambas tablas
    desinstalarApp(usuario.id, appId)
      .then((response) => {
        console.log("App desinstalada exitosamente:", response.data);
        // Recargar la lista de descargas para actualizar la UI
        loadDownloads();
      })
      .catch((error) => {
        console.error("Error desinstalando app:", error);

        // Si hay un error, al menos remover localmente del estado
        setDownloadedApps((prev) =>
          prev.filter((app) => app.id !== appId && app.appId !== appId)
        );
      });
  };
  // Pause individual download and move it back to pending
  const handlePauseDownload = (appId) => {
    // clear timers
    clearInterval(downloadTimers.current[appId]);
    clearTimeout(timeoutTimers.current[appId]);
    // find the download item
    const paused = downloadingApps.find((d) => d.id === appId);
    if (paused) {
      setPendingAppsList((prev) => {
        // avoid duplicates: remove existing then add
        const without = prev.filter((a) => a.id !== appId);
        return [...without, paused];
      });
    }
    // remove from downloading
    setDownloadingApps((prev) => {
      const updated = prev.filter((d) => d.id !== appId);
      persistentDownloadingApps = updated;
      return updated;
    });
  };
  // Pause all downloads
  const handlePauseAll = () => {
    downloadingApps.forEach((d) => handlePauseDownload(d.id));
  };
  // Download all pending
  const handleDownloadAll = () => {
    pendingApps.forEach((a) => {
      // remove from pending list
      setPendingAppsList((prev) => prev.filter((p) => p.id !== a.id));
      handleStartDownload(a);
    });
  };
  // Delete all pending (clear list)
  const handleDeleteAllPending = () => {
    setPendingAppsList([]);
  };
  // Clear download history
  const handleClearHistory = async () => {
    if (clearingHistory) {
      console.log("Ya se está limpiando el historial, esperando...");
      return;
    }

    try {
      setClearingHistory(true);

      if (!usuario || !usuario.id) {
        console.warn("No hay usuario válido para limpiar historial");
        alert("Error: No hay usuario válido");
        return;
      }

      if (!downloadedApps || downloadedApps.length === 0) {
        console.log("No hay historial para limpiar");
        alert("No hay historial para limpiar");
        return;
      }

      console.log(
        "Limpiando historial de descargas:",
        downloadedApps.length,
        "elementos"
      );

      // Limpiar el estado local primero para mejorar la UX
      const appsToRemove = [...downloadedApps];
      setDownloadedApps([]);

      // Procesar cada app de manera secuencial para evitar errores
      let successCount = 0;
      let errorCount = 0;

      for (const app of appsToRemove) {
        try {
          if (!app || !app.id) {
            console.warn("App con datos inválidos:", app);
            errorCount++;
            continue;
          }

          console.log("Procesando app del historial:", app.name, "ID:", app.id);

          // Usar la API de desinstalación
          if (app.downloadId) {
            await desinstalarApp(usuario.id, app.id);
            successCount++;
            console.log("App desinstalada exitosamente:", app.name);
          } else {
            console.warn("App sin downloadId:", app);
            errorCount++;
          }
        } catch (error) {
          console.error("Error desinstalando app:", app.name, error);
          errorCount++;
        }

        // Pequeña pausa para evitar sobrecargar el servidor
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Recargar la lista para asegurar sincronización
      await loadDownloads();

      // Mostrar resultado al usuario
      if (successCount > 0) {
        alert(
          `Historial limpiado exitosamente. ${successCount} aplicaciones removidas.`
        );
      }
      if (errorCount > 0) {
        console.warn(`${errorCount} aplicaciones no pudieron ser removidas`);
      }
    } catch (error) {
      console.error("Error crítico limpiando historial:", error);
      alert("Ocurrió un error al limpiar el historial. Inténtalo de nuevo.");

      // Recargar para restaurar el estado correcto
      loadDownloads();
    } finally {
      setClearingHistory(false);
    }
  };

  // Keep download timers active when navigating away, so downloads continue in background
  // (cleanup occurs when downloads complete or on app exit)
  // Resume ongoing downloads on mount
  useEffect(() => {
    persistentDownloadingApps.forEach((app) => {
      // skip if timer exists
      if (downloadTimers.current[app.id]) return;
      // resume progress interval
      const interval = setInterval(() => {
        setDownloadingApps((prev) => {
          const updated = prev.map((d) =>
            d.id === app.id
              ? { ...d, progress: Math.min(d.progress + 100 / 240, 100) }
              : d
          );
          persistentDownloadingApps = updated;
          return updated;
        });
      }, 1000);
      downloadTimers.current[app.id] = interval;
      // resume timeout for remaining
      const remaining = ((100 - app.progress) / 100) * 240000;
      const timeoutId = setTimeout(() => {
        clearInterval(downloadTimers.current[app.id]);
        setDownloadingApps((prev) => prev.filter((d) => d.id !== app.id));
        persistentDownloadingApps = persistentDownloadingApps.filter(
          (d) => d.id !== app.id
        );
        alert(`${app.name} ${getText("downloadComplete") || "instalado"}`);
      }, remaining);
      timeoutTimers.current[app.id] = timeoutId;
    });
  }, []);

  const renderDownloadedApp = ({ item }) => {
    // Validación de datos del item
    if (!item || !item.id) {
      console.warn("Item de descarga inválido:", item);
      return null;
    }

    return (
      <View style={[styles.appItem, { backgroundColor: theme.cardBackground }]}>
        <View
          style={[styles.appIcon, { backgroundColor: theme.backgroundColor }]}
        >
          {item.icon ? (
            <Image
              source={{ uri: item.icon }}
              style={{ width: 40, height: 40, borderRadius: 8 }}
            />
          ) : (
            <Ionicons
              name="alert-circle"
              size={40}
              color={theme.secondaryTextColor}
            />
          )}
        </View>
        <View style={styles.appInfo}>
          <Text style={[styles.appName, { color: theme.textColor }]}>
            {item.name || "Aplicación sin nombre"}
          </Text>
          <Text
            style={[styles.appCategory, { color: theme.secondaryTextColor }]}
          >
            {item.category || "Sin categoría"}
          </Text>
          <Text
            style={[styles.appDetails, { color: theme.secondaryTextColor }]}
          >
            {item.size || "Desconocido"} •{" "}
            {item.downloadDate
              ? new Date(item.downloadDate).toLocaleDateString()
              : "Fecha desconocida"}
          </Text>
          <Text
            style={[styles.appVersion, { color: theme.secondaryTextColor }]}
          >
            Versión {item.version || "1.0"}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={() => handleUninstall(item.id, item.downloadId)}
        >
          <Text style={{ color: "#FF3B30", fontWeight: "600" }}>
            {getText("uninstall") || "Desinstalar"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderDownloadingApp = ({ item }) => (
    <View style={[styles.appItem, { backgroundColor: theme.cardBackground }]}>
      <View
        style={[styles.appIcon, { backgroundColor: theme.backgroundColor }]}
      >
        {item.icon ? (
          <Image
            source={{ uri: item.icon }}
            style={{ width: 40, height: 40, borderRadius: 8 }}
          />
        ) : (
          <Ionicons
            name="alert-circle"
            size={40}
            color={theme.secondaryTextColor}
          />
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
        <View
          style={[
            styles.progressBar,
            { backgroundColor: theme.backgroundColor },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              { width: `${item.progress}%`, backgroundColor: theme.primary },
            ]}
          />
        </View>
        <Text
          style={[styles.progressText, { color: theme.secondaryTextColor }]}
        >
          {`${Math.round(item.progress)}%`}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.pauseButton}
        onPress={() => handlePauseDownload(item.id)}
      >
        <Ionicons name="pause" size={20} color={theme.secondaryTextColor} />
      </TouchableOpacity>
    </View>
  );

  const renderPendingApp = ({ item }) => (
    <View style={[styles.appItem, { backgroundColor: theme.cardBackground }]}>
      <View
        style={[styles.appIcon, { backgroundColor: theme.backgroundColor }]}
      >
        {item.icon ? (
          <Image
            source={{ uri: item.icon }}
            style={{ width: 40, height: 40, borderRadius: 8 }}
          />
        ) : (
          <Ionicons
            name="alert-circle"
            size={40}
            color={theme.secondaryTextColor}
          />
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
        <Ionicons name="download" size={20} color={theme.primary} />
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
      <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            const parentNav = navigation.getParent();
            if (parentNav) {
              parentNav.navigate("Profile", { screen: "ProfileMain" });
            } else {
              navigation.navigate("ProfileMain");
            }
          }}
        >
          <Ionicons name="chevron-back" size={24} color={theme.textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textColor }]}>
          {getText("downloads")}
        </Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate("ProfileMain")}
        >
          <Ionicons name="settings-outline" size={24} color={theme.textColor} />
        </TouchableOpacity>
      </View>

      {/* Main Content using FlatList */}
      <FlatList
        data={getCurrentData()}
        renderItem={renderApp}
        keyExtractor={(item) =>
          (item.downloadId != null ? item.downloadId : item.id).toString()
        }
        style={[{ flex: 1 }, { backgroundColor: theme.backgroundColor }]}
        contentContainerStyle={{
          flexGrow: 1,
          backgroundColor: theme.backgroundColor,
          paddingBottom: 20,
        }}
        showsVerticalScrollIndicator={false}
        onError={(error) => {
          console.error("Error en FlatList:", error);
        }}
        ListEmptyComponent={() => (
          <View
            style={[
              styles.emptyContainer,
              { backgroundColor: theme.backgroundColor },
            ]}
          >
            <Ionicons
              name={
                activeTab === "downloaded" ? "download-outline" : "time-outline"
              }
              size={64}
              color={theme.secondaryTextColor}
            />
            <Text
              style={[styles.emptyText, { color: theme.secondaryTextColor }]}
            >
              {activeTab === "downloaded"
                ? getText("no_downloads") ||
                  "No tienes aplicaciones descargadas"
                : getText("no_pending") || "No tienes descargas pendientes"}
            </Text>
          </View>
        )}
        ListHeaderComponent={() => (
          <>
            {/* Tabs */}
            <View
              style={[
                styles.tabContainer,
                {
                  backgroundColor: theme.cardBackground,
                  shadowColor: theme.textColor + "30",
                },
              ]}
            >
              {Array.isArray(tabs) && tabs.length > 0
                ? tabs.map((tab) => (
                    <TouchableOpacity
                      key={tab.id}
                      style={[
                        styles.tab,
                        activeTab === tab.id && {
                          backgroundColor: theme.primary,
                        },
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
                  ))
                : null}
            </View>

            {/* Storage Info */}
            <View
              style={[
                styles.storageInfo,
                {
                  backgroundColor: theme.cardBackground,
                  shadowColor: theme.textColor,
                },
              ]}
            >
              <View style={styles.storageLeft}>
                <Ionicons
                  name="phone-portrait"
                  size={20}
                  color={theme.secondaryTextColor}
                />
                <Text
                  style={[
                    styles.storageText,
                    { color: theme.secondaryTextColor },
                  ]}
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
          </>
        )}
        ListFooterComponent={() =>
          getCurrentData().length > 0 ? (
            <View
              style={[
                styles.bottomActions,
                {
                  backgroundColor: theme.cardBackground,
                  borderTopColor: theme.secondaryTextColor + "20",
                },
              ]}
            >
              {activeTab === "pending" && (
                <>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleDownloadAll}
                  >
                    <Text
                      style={[
                        styles.actionButtonText,
                        { color: theme.primary },
                      ]}
                    >
                      {getText("downloadAll") || "Descargar todo"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleDeleteAllPending}
                  >
                    <Text
                      style={[
                        styles.actionButtonText,
                        { color: theme.primary },
                      ]}
                    >
                      {getText("deleteAll") || "Eliminar todo"}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
              {activeTab === "downloading" && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handlePauseAll}
                >
                  <Text
                    style={[styles.actionButtonText, { color: theme.primary }]}
                  >
                    {getText("pauseAll") || "Pausar todo"}
                  </Text>
                </TouchableOpacity>
              )}
              {activeTab === "downloaded" && (
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    clearingHistory && { opacity: 0.5 },
                  ]}
                  onPress={handleClearHistory}
                  disabled={clearingHistory}
                >
                  <Text
                    style={[styles.actionButtonText, { color: theme.primary }]}
                  >
                    {clearingHistory
                      ? "Limpiando..."
                      : getText("clearHistory") || "Limpiar historial"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 0,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  settingsButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 12,
    marginHorizontal: 8,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginTop: 12,
    marginHorizontal: 8,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  storageLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  storageText: {
    marginLeft: 10,
    fontSize: 14,
  },
  manageStorage: {
    fontSize: 14,
    fontWeight: "600",
  },
  appsList: {
    flex: 1,
    marginTop: 10,
    backgroundColor: "transparent",
  },
  appItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 8,
    marginBottom: 6,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  appIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
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
    marginBottom: 2,
  },
  appCategory: {
    fontSize: 14,
    marginBottom: 2,
  },
  appDetails: {
    fontSize: 12,
    marginBottom: 2,
  },
  appVersion: {
    fontSize: 12,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginRight: 10,
    marginTop: 4,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
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
    backgroundColor: "transparent",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  bottomActions: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
    lineHeight: 24,
  },
});
