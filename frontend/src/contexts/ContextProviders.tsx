import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/contexts/auth'
import { ThemeProvider } from '@/contexts/theme/ThemeProvider'
import { LoaderProvider } from '@/contexts/loader/LoaderProvider'
import { Toaster } from '@/components/ui/sonner'

export const ContextProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider storageKey="app-theme">
      <Toaster position="top-right" expand={true} richColors closeButton />
      {/* Adjust the basename as needed */}
      <BrowserRouter basename={'/'}>
        <AuthProvider>
          <LoaderProvider>{children}</LoaderProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
