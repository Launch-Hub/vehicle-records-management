import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/contexts/auth/AuthContext'
import { ThemeProvider } from '@/contexts/theme/ThemeProvider'
import { LoaderProvider } from '@/contexts/loader/LoaderProvider'
import { Toaster } from '@/components/ui/sonner'

export const ContextProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider storageKey="app-theme">
      <Toaster position="top-right" expand={true} richColors closeButton />
      <AuthProvider>
        {/* Adjust the basename as needed */}
        <LoaderProvider>
          <BrowserRouter basename={'/'}>{children}</BrowserRouter>
        </LoaderProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
