import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND_DEV_HOST = "http://localhost:3001";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      "/auth": `${BACKEND_DEV_HOST}`,
      "/user": `${BACKEND_DEV_HOST}`,
      "/scrape": `${BACKEND_DEV_HOST}`,
      "/articles": `${BACKEND_DEV_HOST}`,
      "/scraper_data": `${BACKEND_DEV_HOST}`,
    },
    
  }
})
