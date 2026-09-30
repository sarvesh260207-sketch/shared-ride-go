import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerOfflineSupport } from "./lib/registerOffline";

createRoot(document.getElementById("root")!).render(<App />);

void registerOfflineSupport();
