import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.tsx";
import "./index.css";
import "./themes/light-theme.css";
import { initScrollReveal } from "./utils/scrollReveal";

// Initialize scroll reveal animations
initScrollReveal();

// Get client ID with fallback
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Validate client ID
if (!clientId) {
  console.error('❌ CRITICAL: VITE_GOOGLE_CLIENT_ID is not defined');
  console.error('📋 Steps to fix:');
  console.error('1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
  console.error('2. Add VITE_GOOGLE_CLIENT_ID with your Google OAuth Client ID');
  console.error('3. Redeploy your application');
}

createRoot(document.getElementById("root")!).render(
  clientId ? (
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  ) : (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div style={{
        maxWidth: '500px',
        padding: '40px',
        backgroundColor: '#1a1a1a',
        borderRadius: '16px',
        border: '1px solid #333',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          margin: '0 auto 24px',
          backgroundColor: '#ef4444',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px'
        }}>
          ⚠️
        </div>
        <h1 style={{ 
          color: '#ef4444', 
          marginBottom: '16px',
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          Configuration Error
        </h1>
        <p style={{ 
          marginBottom: '12px',
          color: '#e5e5e5',
          fontSize: '16px'
        }}>
          Google Client ID is not configured.
        </p>
        <div style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: '#262626',
          borderRadius: '8px',
          textAlign: 'left'
        }}>
          <p style={{ 
            fontSize: '14px', 
            color: '#9ca3af',
            marginBottom: '12px',
            fontWeight: '600'
          }}>
            To fix this:
          </p>
          <ol style={{
            fontSize: '14px',
            color: '#d1d5db',
            paddingLeft: '20px',
            lineHeight: '1.8'
          }}>
            <li>Go to <strong>Vercel Dashboard</strong> → Your Project → <strong>Settings</strong> → <strong>Environment Variables</strong></li>
            <li>Add <code style={{ backgroundColor: '#1a1a1a', padding: '2px 6px', borderRadius: '4px' }}>VITE_GOOGLE_CLIENT_ID</code> with your Google OAuth Client ID</li>
            <li><strong>Redeploy</strong> your application</li>
          </ol>
        </div>
        <p style={{ 
          fontSize: '12px', 
          color: '#6b7280',
          marginTop: '24px'
        }}>
          If you're the administrator, please configure the environment variable and redeploy.
        </p>
      </div>
    </div>
  )
);
