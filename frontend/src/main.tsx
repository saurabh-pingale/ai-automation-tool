import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { AuthProvider } from './providers/AuthProvider.tsx'
import { AppRouter } from './routes/index.tsx'
import { ErrorBoundary } from './components/ui/ErrorBoundary.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)