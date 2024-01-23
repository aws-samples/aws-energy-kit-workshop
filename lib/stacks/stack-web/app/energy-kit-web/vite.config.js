import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base: "",
  build: {
    outDir: "./build", // specifies the out directory as build to match react-app specs
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: "globalThis", //<-- AWS SDK
      },
    },
  },
  plugins: [react()],
  resolve: {
    // this is required for Amplify
    alias: {
      "./runtimeConfig": "./runtimeConfig.browser",
    },
    build: {
      rollupOptions: {
        external: ["child_process"], // builds child_process externally
      },
    },
  },
});
