import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/contexts/auth'
import { ThemeProvider } from '@/contexts/theme/ThemeProvider'
import { LoaderProvider } from '@/contexts/loader/LoaderProvider'
import { Toaster } from '@/components/ui/sonner'

export const ContextProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider storageKey="app-theme">
      <Toaster position="top-right" expand={true} richColors closeButton />
      <BrowserRouter basename="/">
        <AuthProvider>
          <LoaderProvider>
            {children} {/* Your App component */}
          </LoaderProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
