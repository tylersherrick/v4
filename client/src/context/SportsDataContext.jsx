import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

const SportsDataContext = createContext(null);

const initialLeagueState = {
  date: "",
  games: [],
  loading: false,
  error: "",
  lastUpdated: null,
};

export function SportsDataProvider({
  children,
}) {
  const [sportsData, setSportsData] = useState({
    mlb: { ...initialLeagueState },
    nfl: { ...initialLeagueState },
    nba: { ...initialLeagueState },
    nhl: { ...initialLeagueState },
    cfb: { ...initialLeagueState },
    cbb: { ...initialLeagueState },
  });

  function updateLeague(
    league,
    updates
  ) {
    setSportsData((previous) => ({
      ...previous,
      [league]: {
        ...previous[league],
        ...updates,
      },
    }));
  }

  function setLeagueGames(
    league,
    date,
    games
  ) {
    updateLeague(league, {
      date,
      games,
      loading: false,
      error: "",
      lastUpdated: Date.now(),
    });
  }

  function setLeagueLoading(
    league,
    loading
  ) {
    updateLeague(league, {
      loading,
    });
  }

  function setLeagueError(
    league,
    error
  ) {
    updateLeague(league, {
      loading: false,
      error,
    });
  }

  function getLeagueGames(
    league,
    date
  ) {
    const data = sportsData[league];

    if (
      data.date === date &&
      data.games.length > 0
    ) {
      return data.games;
    }

    return null;
  }

  function clearLeague(league) {
    setSportsData((previous) => ({
      ...previous,
      [league]: {
        ...initialLeagueState,
      },
    }));
  }

  const value = useMemo(
    () => ({
      sportsData,
      updateLeague,
      setLeagueGames,
      setLeagueLoading,
      setLeagueError,
      getLeagueGames,
      clearLeague,
    }),
    [sportsData]
  );

  return (
    <SportsDataContext.Provider
      value={value}
    >
      {children}
    </SportsDataContext.Provider>
  );
}

export function useSportsData() {
  const context =
    useContext(SportsDataContext);

  if (!context) {
    throw new Error(
      "useSportsData must be used within a SportsDataProvider."
    );
  }

  return context;
}