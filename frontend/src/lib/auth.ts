export const ACCESS_TOKEN_KEY = 'access_token'
export const REFRESH_TOKEN_KEY = 'refresh_token'
export const LAST_ACTIVE_KEY = 'last_active'
export const USER_KEY = 'user'

export const getUserLocal = () => JSON.parse(localStorage.getItem(USER_KEY) || '{}')
export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY)
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY)
export const updateLastActive = () => localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString())

export const getLastActive = () => Number(localStorage.getItem(LAST_ACTIVE_KEY) || '0')

export const storeTokens = (accessToken: string, refreshToken: string, user?: any) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
  updateLastActive()
}
export const clearSession = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(LAST_ACTIVE_KEY)
}
