const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const LAST_ACTIVE_KEY = 'last_active'

export const getAccessToken = () => sessionStorage.getItem(ACCESS_TOKEN_KEY)
export const getRefreshToken = () => sessionStorage.getItem(REFRESH_TOKEN_KEY)
export const updateLastActive = () => sessionStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString())
export const getLastActive = () => Number(sessionStorage.getItem(LAST_ACTIVE_KEY) || '0')

export const storeTokens = (accessToken: string, refreshToken: string, user?: any) => {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  if (user) sessionStorage.setItem('user', JSON.stringify(user))
  updateLastActive()
}
