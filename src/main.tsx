import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App.tsx';
import './index.css';

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  console.warn("Clerk Publishable Key is missing! Patients will not be able to log in.");
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Auth0Provider
      domain="dev-0us4zti7uxq0g6g4.jp.auth0.com"
      clientId="vTPLMTDG7XPUVqhRcqhftYiWr7oneixS"
      authorizationParams={{
        redirect_uri: window.location.origin
      }}
    >
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    </Auth0Provider>
  </StrictMode>
);
