import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState("es");

  // Cargar configuraciones guardadas al iniciar
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("theme");
      const savedLanguage = await AsyncStorage.getItem("language");

      if (savedTheme !== null) {
        setIsDarkMode(JSON.parse(savedTheme));
      }
      if (savedLanguage !== null) {
        setLanguage(savedLanguage);
      }
    } catch (error) {
      console.log("Error loading settings:", error);
    }
  };

  const toggleTheme = async (value) => {
    try {
      setIsDarkMode(value);
      await AsyncStorage.setItem("theme", JSON.stringify(value));
    } catch (error) {
      console.log("Error saving theme:", error);
    }
  };

  const changeLanguage = async (lang) => {
    try {
      setLanguage(lang);
      await AsyncStorage.setItem("language", lang);
    } catch (error) {
      console.log("Error saving language:", error);
    }
  };

  // Textos en diferentes idiomas
  const texts = {
    es: {
      // Home Screen
      home: "Inicio",
      search: "Buscar",
      profile: "Perfil",
      categories: "Categorías",
      featuredGames: "Juegos Destacados",

      // Categories
      action: "Acción",
      adventure: "Aventura",
      arcade: "Arcade",
      puzzle: "Puzzle",
      racing: "Carreras",
      rpg: "RPG",
      simulation: "Simulación",
      sports: "Deportes",
      strategy: "Estrategia",

      // Home Screen specific
      trending: "Juegos en tendencia",
      newReleases: "Nuevos lanzamientos",
      offers: "Ofertas",
      freeGames: "Juegos gratuitos",
      topFreeGames: "Top juegos gratis",
      multiplayer: "Multijugador",
      topPaidGames: "Top juegos de pago",
      offlineGames: "Juegos sin conexión",
      seeMore: "Ver más",
      install: "Instalar",
      installing: "Instalando",

      // Search Screen
      searchApps: "Buscar aplicaciones...",
      noResults: "No se encontraron resultados",
      tryOtherTerms: "Prueba con otros términos de búsqueda",
      popularSearches: "Búsquedas populares",

      // App Details Screen
      description: "Descripción",
      techSpecs: "Ficha Técnica",
      reviews: "Calificaciones y reseñas",
      developer: "Vendedor",
      size: "Tamaño",
      category: "Categoría",
      compatibility: "Compatibilidad",
      version: "Versión",
      updated: "Actualizado",
      similarGames: "Juegos similares",
      years: "años",
      free: "Gratis",
      file: "Archivo",
      ageRating: "+12años",
      gameDescription:
        "Sumérgete en el salvaje oeste americano en esta épica aventura de mundo abierto.",

      // Profile
      myProfile: "Mi perfil",
      editProfile: "Editar perfil",
      logout: "Cerrar sesión",
      settings: "Configuración",
      success: "Éxito",
      profileUpdated: "Perfil actualizado correctamente",
      confirmLogout: "¿Estás seguro de que quieres cerrar sesión?",

      // Settings
      notifications: "Notificaciones",
      language: "Idioma",
      darkMode: "Modo oscuro/claro",
      downloads: "Descargas",
      purchases: "Compras",
      storage: "Almacenamiento",
      help: "Ayuda",
      history: "Historial",

      // Common
      save: "Guardar",
      cancel: "Cancelar",
      close: "Cerrar",
      back: "Atrás",
      name: "Nombre",
      email: "Correo electrónico",
      phone: "Teléfono",
      country: "País",
      install: "Instalar",
      noFavorites: "No tienes favoritos",
      noFavoritesDesc:
        "Explora aplicaciones y marca las que más te gusten como favoritas",
      exploreApps: "Explorar aplicaciones",

      // Help Screen
      helpCenter: "Centro de Ayuda",
      searchHelp: "Buscar en la ayuda...",
      needImmediateHelp: "¿Necesitas ayuda inmediata?",
      contactSupport: "Contactar Soporte",
      contactSupportDesc: "Habla con nuestro equipo de atención al cliente",
      reportProblem: "Reportar un Problema",
      reportProblemDesc: "Reporta errores o problemas técnicos",
      sendFeedback: "Enviar Comentarios",
      sendFeedbackDesc: "Ayúdanos a mejorar DevPlay Store",
      communityForum: "Foro de la Comunidad",
      communityForumDesc: "Conecta con otros usuarios",
      searchResults: "Resultados de búsqueda",
      faq: "Preguntas Frecuentes",
      noSearchResults: "No se encontraron resultados",
      noSearchResultsDesc:
        "Intenta con otras palabras clave o contacta con soporte",
      moreHelp: "¿Necesitas más ayuda?",
      contactUsAnytime: "Contáctanos en cualquier momento",
      contactInfo: "Información de Contacto",
      businessHours: "Lunes a Viernes, 9:00 AM - 6:00 PM",
      privacyPolicy: "Política de Privacidad",
      termsOfService: "Términos de Servicio",

      // History Screen
      searches: "Búsquedas",
      appsViewed: "Apps Vistas",
      clear: "Limpiar",
      searchHistory: "Buscar en historial...",
      results: "resultado",
      resultsPlural: "resultados",
      today: "Hoy a las",
      yesterday: "Ayer a las",
      downloaded: "Descargada",
      viewed: "Vista",
      noSearchHistory: "Sin historial de búsquedas",
      noViewHistory: "Sin historial de aplicaciones",
      noHistoryMessage: "Tu actividad aparecerá aquí",
      searchActivity: "Actividad de Búsqueda",
      browsingActivity: "Actividad de Navegación",
      activeDays: "Días activos",
      perDay: "Por día",
      noRecentSearches: "No hay búsquedas recientes",
      noAppsViewed: "No hay apps vistas",
      tryOtherTerms: "Intenta con otros términos de búsqueda",
      searchesAppearHere: "Tus búsquedas aparecerán aquí",
      appsAppearHere: "Las apps que veas aparecerán aquí",
      privacyNotice:
        "Tu historial se almacena localmente y puedes eliminarlo en cualquier momento",

      // Purchase Screen
      myPurchases: "Mis Compras",
      totalApps: "Total de apps",
      totalSpent: "Total gastado",
      freeApps: "Apps gratuitas",
      all: "Todos",
      paid: "Pagadas",
      free: "Gratuitas",
      owned: "Poseído",
      noPaidPurchases: "No tienes compras pagadas",
      noFreeApps: "No tienes apps gratuitas",
      noPurchases: "No tienes compras",
      purchasesHistoryMessage:
        "Las aplicaciones que descargues aparecerán en tu historial de compras",
      needPurchaseHelp: "¿Necesitas ayuda con una compra?",
      refunded: "Reembolsado",
      noPaidPurchases: "No tienes compras pagadas",
      noFreeApps: "No tienes apps gratuitas",
      noPurchases: "No tienes compras",
      purchasesDesc:
        "Las aplicaciones que descargues aparecerán en tu historial de compras",

      // Downloads Screen
      downloaded: "Descargadas",
      downloading: "Descargando",
      pending: "Pendientes",
      manage: "Administrar",
      spaceUsed: "Espacio usado",
      clearHistory: "Limpiar historial",
      noDownloads: "No hay aplicaciones descargadas",
      noDownloading: "No hay descargas en progreso",
      noPending: "No hay descargas pendientes",
      downloadsAppearHere: "Las aplicaciones que descargues aparecerán aquí",

      // Game specific
      games: "Juegos",
      gameStore: "Tienda de Juegos",
      freeGames: "Juegos Gratis",
      premiumGames: "Juegos Premium",
      newGames: "Juegos Nuevos",
      topGames: "Top Juegos",
      myGames: "Mis Juegos",
      downloadedGames: "Juegos Descargados",

      // Notifications
      newGameAlerts: "Alertas de juegos nuevos",
      gameOffers: "Ofertas de juegos",
      gameUpdates: "Actualizaciones de juegos",
      tournamentNotifications: "Notificaciones de torneos",

      // Storage specific to games
      gameData: "Datos de juegos",
      gameCache: "Caché de juegos",
      gameDownloads: "Descargas de juegos",
      savedGames: "Partidas guardadas",

      // Additional notification texts
      configuration: "Configuración",
      newReleases: "Nuevos lanzamientos",
      newGamesDesc: "Recibe notificaciones sobre nuevos juegos",
      offersDeals: "Ofertas y descuentos",
      offersDesc: "No te pierdas las mejores ofertas",
      downloadsCompleted: "Descargas completadas",
      downloadsDesc: "Notifica cuando terminen las descargas",
      updatesDesc: "Informa sobre actualizaciones disponibles",
      recentNotifications: "Notificaciones recientes",
      newGameAvailable: "Nuevo juego disponible",
      codNewSeason: "Call of Duty Mobile ha lanzado una nueva temporada",
      specialOffer: "Oferta especial",
      minecraftDiscount: "Minecraft tiene 50% de descuento por tiempo limitado",
      downloadComplete: "Descarga completada",
      pubgDownloaded: "PUBG Mobile se ha descargado correctamente",
      yesterday: "Ayer",
      hoursAgo: "Hace {0} horas",

      // Language Screen
      selectLanguage: "Seleccionar idioma",
      languageInfo: "Información",
      languageDescription:
        "Cambiar el idioma afectará toda la aplicación. Los juegos y contenido se mostrarán en el idioma seleccionado.",

      // Dark Mode Screen
      preview: "Vista Previa",
      currentTheme: "Tema actual",
      themeOptions: "Opciones de Tema",
      lightMode: "Modo Claro",
      lightModeDesc: "Fondo blanco con texto oscuro",
      darkModeOption: "Modo Oscuro",
      darkModeDesc: "Fondo oscuro con texto claro",
      autoMode: "Automático",
      autoModeDesc: "Sigue la configuración del sistema",
    },
    en: {
      // Home Screen
      home: "Home",
      search: "Search",
      profile: "Profile",
      categories: "Categories",
      featuredGames: "Featured Games",

      // Categories
      action: "Action",
      adventure: "Adventure",
      arcade: "Arcade",
      puzzle: "Puzzle",
      racing: "Racing",
      rpg: "RPG",
      simulation: "Simulation",
      sports: "Sports",
      strategy: "Strategy",

      // Home Screen specific
      trending: "Trending Games",
      newReleases: "New Releases",
      offers: "Offers",
      freeGames: "Free Games",
      topFreeGames: "Top Free Games",
      multiplayer: "Multiplayer",
      topPaidGames: "Top Paid Games",
      offlineGames: "Offline Games",
      seeMore: "See More",
      install: "Install",
      installing: "Installing",

      // Search Screen
      searchApps: "Search applications...",
      noResults: "No results found",
      tryOtherTerms: "Try other search terms",
      popularSearches: "Popular Searches",

      // App Details Screen
      description: "Description",
      techSpecs: "Technical Info",
      reviews: "Ratings and reviews",
      developer: "Developer",
      size: "Size",
      category: "Category",
      compatibility: "Compatibility",
      version: "Version",
      updated: "Updated",
      similarGames: "Similar Games",
      years: "years",
      free: "Free",
      file: "File",
      ageRating: "+12years",
      gameDescription:
        "Immerse yourself in the American Wild West in this epic open-world adventure.",

      // Profile
      myProfile: "My profile",
      editProfile: "Edit profile",
      logout: "Sign out",
      settings: "Settings",
      success: "Success",
      profileUpdated: "Profile updated successfully",
      confirmLogout: "Are you sure you want to logout?",

      // Settings
      notifications: "Notifications",
      language: "Language",
      darkMode: "Dark/Light mode",
      downloads: "Downloads",
      purchases: "Purchases",
      storage: "Storage",
      help: "Help",
      history: "History",

      // Common
      save: "Save",
      cancel: "Cancel",
      close: "Close",
      back: "Back",
      name: "Name",
      email: "Email",
      phone: "Phone",
      country: "Country",
      install: "Install",
      noFavorites: "No favorites",
      noFavoritesDesc:
        "Explore apps and mark the ones you like most as favorites",
      exploreApps: "Explore apps",

      // Help Screen
      helpCenter: "Help Center",
      searchHelp: "Search help...",
      needImmediateHelp: "Need immediate help?",
      contactSupport: "Contact Support",
      contactSupportDesc: "Talk to our customer service team",
      reportProblem: "Report a Problem",
      reportProblemDesc: "Report bugs or technical issues",
      sendFeedback: "Send Feedback",
      sendFeedbackDesc: "Help us improve DevPlay Store",
      communityForum: "Community Forum",
      communityForumDesc: "Connect with other users",
      searchResults: "Search results",
      faq: "Frequently Asked Questions",
      noSearchResults: "No results found",
      noSearchResultsDesc: "Try other keywords or contact support",
      moreHelp: "Need more help?",
      contactUsAnytime: "Contact us anytime",
      contactInfo: "Contact Information",
      businessHours: "Monday to Friday, 9:00 AM - 6:00 PM",
      privacyPolicy: "Privacy Policy",
      termsOfService: "Terms of Service",

      // History Screen
      searches: "Searches",
      appsViewed: "Apps Viewed",
      clear: "Clear",
      searchHistory: "Search history...",
      results: "result",
      resultsPlural: "results",
      today: "Today at",
      yesterday: "Yesterday at",
      downloaded: "Downloaded",
      viewed: "Viewed",
      noSearchHistory: "No search history",
      noViewHistory: "No app history",
      noHistoryMessage: "Your activity will appear here",
      searchActivity: "Search Activity",
      browsingActivity: "Browsing Activity",
      activeDays: "Active days",
      perDay: "Per day",
      noRecentSearches: "No recent searches",
      noAppsViewed: "No apps viewed",
      tryOtherTerms: "Try other search terms",
      searchesAppearHere: "Your searches will appear here",
      appsAppearHere: "Apps you view will appear here",
      privacyNotice:
        "Your history is stored locally and you can delete it at any time",

      // Purchase Screen
      myPurchases: "My Purchases",
      totalApps: "Total apps",
      totalSpent: "Total spent",
      freeApps: "Free apps",
      all: "All",
      paid: "Paid",
      free: "Free",
      owned: "Owned",
      refunded: "Refunded",
      noPaidPurchases: "No paid purchases",
      noFreeApps: "No free apps",
      noPurchases: "No purchases",
      purchasesHistoryMessage:
        "Downloaded apps will appear in your purchase history",
      needPurchaseHelp: "Need help with a purchase?",

      // Downloads Screen
      downloaded: "Downloaded",
      downloading: "Downloading",
      pending: "Pending",
      manage: "Manage",
      spaceUsed: "Space used",
      clearHistory: "Clear history",
      noDownloads: "No downloaded apps",
      noDownloading: "No downloads in progress",
      noPending: "No pending downloads",
      downloadsAppearHere: "Downloaded apps will appear here",

      // Game specific
      games: "Games",
      gameStore: "Game Store",
      freeGames: "Free Games",
      premiumGames: "Premium Games",
      newGames: "New Games",
      topGames: "Top Games",
      myGames: "My Games",
      downloadedGames: "Downloaded Games",

      // Notifications
      newGameAlerts: "New game alerts",
      gameOffers: "Game offers",
      gameUpdates: "Game updates",
      tournamentNotifications: "Tournament notifications",

      // Storage specific to games
      gameData: "Game data",
      gameCache: "Game cache",
      gameDownloads: "Game downloads",
      savedGames: "Saved games",

      // Additional notification texts
      configuration: "Configuration",
      newReleases: "New Releases",
      newGamesDesc: "Get notifications about new games",
      offersDeals: "Offers & Deals",
      offersDesc: "Don't miss the best deals",
      downloadsCompleted: "Downloads Completed",
      downloadsDesc: "Notify when downloads finish",
      updatesDesc: "Notify about available updates",
      recentNotifications: "Recent Notifications",
      newGameAvailable: "New game available",
      codNewSeason: "Call of Duty Mobile launched a new season",
      specialOffer: "Special Offer",
      minecraftDiscount: "Minecraft has 50% discount for limited time",
      downloadComplete: "Download Complete",
      pubgDownloaded: "PUBG Mobile downloaded successfully",
      yesterday: "Yesterday",
      hoursAgo: "{0} hours ago",

      // Language Screen
      selectLanguage: "Select Language",
      languageInfo: "Information",
      languageDescription:
        "Changing the language will affect the entire application. Games and content will be displayed in the selected language.",

      // Dark Mode Screen
      preview: "Preview",
      currentTheme: "Current theme",
      themeOptions: "Theme Options",
      lightMode: "Light Mode",
      lightModeDesc: "White background with dark text",
      darkModeOption: "Dark Mode",
      darkModeDesc: "Dark background with light text",
      autoMode: "Automatic",
      autoModeDesc: "Follows system settings",
    },
  };

  const getText = (key, param) => {
    const text = texts[language][key] || key;
    if (param && text.includes("{0}")) {
      return text.replace("{0}", param);
    }
    return text;
  };

  // Helper para traducir datos de juegos
  const getGameText = (textData) => {
    if (typeof textData === "string") {
      return textData; // Si es un string simple, devolverlo
    }
    if (typeof textData === "object" && textData !== null) {
      return textData[language] || textData.es || textData.en || ""; // Priorizar idioma actual
    }
    return "";
  };

  // Temas de colores
  const themes = {
    light: {
      backgroundColor: "#f8f9fa",
      cardBackground: "#ffffff",
      textColor: "#333333",
      secondaryTextColor: "#666666",
      textSecondary: "#666666",
      textTertiary: "#999999",
      iconColor: "#666666",
      primary: "#8E44AD",
      border: "#f0f0f0",
      success: "#34C759",
      warning: "#FF9500",
      error: "#FF3B30",
    },
    dark: {
      backgroundColor: "#1a1a1a",
      cardBackground: "#2a2a2a",
      textColor: "#ffffff",
      secondaryTextColor: "#cccccc",
      textSecondary: "#cccccc",
      textTertiary: "#999999",
      iconColor: "#cccccc",
      primary: "#8E44AD",
      border: "#444444",
      success: "#34C759",
      warning: "#FF9500",
      error: "#FF3B30",
    },
  };

  const theme = isDarkMode ? themes.dark : themes.light;

  const value = {
    isDarkMode,
    language,
    theme,
    toggleTheme,
    changeLanguage,
    getText,
    getGameText,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
