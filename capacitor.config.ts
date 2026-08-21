import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.fadagri.app",
  appName: "FADAGRI",
  // `webDir` is required by the Capacitor CLI but never actually shown:
  // `server.url` below makes the native WebView load the live site
  // directly, so every web deploy (Netlify) reaches the app immediately
  // without a new store submission. `www/index.html` only exists as an
  // offline/loading fallback.
  webDir: "www",
  server: {
    url: "https://fadagri.netlify.app",
    // The site is HTTPS-only already; no cleartext (plain HTTP) needed.
    cleartext: false,
  },
  android: {
    // The one setting Android needs since we're not bundling local assets.
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      backgroundColor: "#f3ecdf",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
  },
};

export default config;
