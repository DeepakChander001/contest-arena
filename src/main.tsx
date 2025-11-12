import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.tsx";
import "./index.css";
import "./themes/light-theme.css";
import { initScrollReveal } from "./utils/scrollReveal";

// Initialize scroll reveal animations
initScrollReveal();

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!clientId) {
  console.error('❌ VITE_GOOGLE_CLIENT_ID is not defined in environment variables');
  console.error('Please add VITE_GOOGLE_CLIENT_ID to your .env file');
}

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={clientId || ''}>
    <App />
  </GoogleOAuthProvider>
);
