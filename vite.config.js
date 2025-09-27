import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// If deploying to GitHub Pages under a repo name, set base to '/<repo-name>/'
// For root domain or local dev, empty string is fine.
export default defineConfig({
  plugins: [react()],
  base: '',
})
