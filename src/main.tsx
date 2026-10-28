import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@openuidev/react-ui/styles/index.css";
import "@/lib/components/components.css";
import "@/lib/components/theme.css";
import "@/lib/components/map/map.css";
import "./styles.css";
import App from "./App";

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
