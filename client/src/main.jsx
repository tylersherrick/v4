import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import "./styles/global.css";
import "./styles/games.css";
import "./styles/game.css";
import "./styles/components.css";
import "./styles/team.css";
import "./styles/player.css";
import App from "./App.jsx";
import { SportsDataProvider } from "./context/SportsDataContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter>
      <SportsDataProvider>
        <App />
      </SportsDataProvider>
    </HashRouter>
  </StrictMode>
);