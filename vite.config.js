import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// "homepage": "https://chezluma.com/",
export default defineConfig({
  plugins: [react()],
  base: './',
})
