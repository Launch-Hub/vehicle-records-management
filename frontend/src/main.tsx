import { createRoot } from 'react-dom/client'
import App from '@/App.tsx'
import '@/index.css'
import { ThemeProvider } from './contexts/theme/ThemeProvider'

// only enable on real production
// if (process.env.NODE_ENV === 'production') {
//   console.log = () => {}
//   console.error = () => {}
//   blockDevTools()
// }

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <ThemeProvider storageKey="app-theme">
    <App />
  </ThemeProvider>
  // </StrictMode>
)
