// App.tsx
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeContext';
import HomePage from './components/HomePage';
import GameSetup from './components/GameSetup';
import Scoreboard from './components/Scoreboard';
import HistoryPage from './components/HistoryPage';

export default function App() {
  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/setup" element={<GameSetup />} />
          <Route path="/scoreboard" element={<Scoreboard />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}
