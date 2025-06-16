const DEFAULT_THEME = import.meta.env.VITE_DEFAULT_THEME || 'system'
const DEFAULT_LANG = import.meta.env.VITE_SYSTEM_LANG || 'en'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export { DEFAULT_THEME, DEFAULT_LANG, API_URL }
