export default function CFBGameTabs({
  activeTab,
  setActiveTab,
}) {
  return (
    <div className="game-tabs">
      <button
        onClick={() => setActiveTab("summary")}
        className={
          activeTab === "summary" ? "active" : ""
        }
      >
        Summary
      </button>

      <button
        onClick={() => setActiveTab("teamStats")}
        className={
          activeTab === "teamStats" ? "active" : ""
        }
      >
        Team Stats
      </button>

      <button
        onClick={() => setActiveTab("playerStats")}
        className={
          activeTab === "playerStats" ? "active" : ""
        }
      >
        Player Stats
      </button>

      <button
        onClick={() => setActiveTab("leaders")}
        className={
          activeTab === "leaders" ? "active" : ""
        }
      >
        Leaders
      </button>
    </div>
  );
}