import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles/global.css";
import "./styles/games.css";
import "./styles/game.css";
import "./styles/components.css";
import "./styles/team.css";
import "./styles/player.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename="/v4">
      <App />
    </BrowserRouter>
  </StrictMode>
);