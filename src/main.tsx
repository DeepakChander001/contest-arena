import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./themes/light-theme.css";
import { initScrollReveal } from "./utils/scrollReveal";

// Initialize scroll reveal animations
initScrollReveal();

createRoot(document.getElementById("root")!).render(<App />);
