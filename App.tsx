// App.tsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider } from './components/ThemeContext';
import HomePage from './components/HomePage';
import GameSetup from './components/GameSetup';
import Scoreboard from './components/Scoreboard';
import HistoryPage from './components/HistoryPage';

type Page = 'home' | 'setup' | 'scoreboard' | 'history';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [players, setPlayers] = useState<string[]>([]);
  const [targetScore, setTargetScore] = useState<number>(10000);
  const [resumeGame, setResumeGame] = useState<boolean>(false);

  const goHome = () => {
    setCurrentPage('home');
    setResumeGame(false);
  };

  const handleNewGame = () => {
    setResumeGame(false);
    setCurrentPage('setup');
  };

  const handleContinueGame = () => {
    setResumeGame(true);
    setCurrentPage('scoreboard');
  };

  const handleStats = () => {
    setCurrentPage('history');
  };

  const handleGameSetupComplete = (playersList: string[], target: number) => {
    setPlayers(playersList);
    setTargetScore(target);
    setResumeGame(false);
    setCurrentPage('scoreboard');
  };

  const handleRestart = () => {
    setPlayers([]);
    setTargetScore(10000);
    setResumeGame(false);
    setCurrentPage('home');
  };

  const clearLocalStorage = async () => {
    try {
      await AsyncStorage.clear();
      console.log('Local storage cleared.');
    } catch (error) {
      console.error('Error clearing local storage:', error);
    }
  };

  let content;
  switch (currentPage) {
    case 'home':
      content = (
        <HomePage 
          onNewGame={handleNewGame}
          onContinueGame={handleContinueGame}
          onStats={handleStats}
          onClearData={clearLocalStorage}
        />
      );
      break;
    case 'setup':
      content = (
        <GameSetup onStartGame={handleGameSetupComplete} headerOnPress={goHome} />
      );
      break;
    case 'scoreboard':
      content = (
        <Scoreboard 
          players={players} 
          targetScore={targetScore} 
          onRestart={handleRestart} 
          headerOnPress={goHome}
          continueGame={resumeGame}
        />
      );
      break;
    case 'history':
      content = (
        <HistoryPage onBack={goHome} />
      );
      break;
    default:
      content = <View />;
  }

  return (
    <ThemeProvider>
      <View style={styles.appContainer}>
        {content}
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
  },
});
