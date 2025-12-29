// components/HomePage.tsx
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomButton from './CustomButton';
import Header from './Header';
import { ThemeContext } from './ThemeContext';
import storage from '../utils/storage';
import Modal from './Modal';
import { GameSessionSummary, listSessions } from '../utils/gameSessionStorage';

const HomePage: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [unfinishedSessions, setUnfinishedSessions] = useState<GameSessionSummary[]>([]);
  const [pickerVisible, setPickerVisible] = useState(false);

  const handleNewGame = () => {
    navigate('/game-setup');
  };

  const refreshSessions = useCallback(async () => {
    try {
      setLoadingSessions(true);
      const sessions = await listSessions();
      setUnfinishedSessions(
        sessions.filter((session) => session.status !== 'completed')
      );
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  const handleClearData = async () => {
    try {
      await storage.clear();
      console.log('Local storage cleared.');
      await refreshSessions();
    } catch (error) {
      console.error('Error clearing local storage:', error);
    }
  };

  useEffect(() => {
    refreshSessions();
    const handleVisibility = () => {
      if (!document.hidden) {
        refreshSessions();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [refreshSessions]);

  const handleContinueGame = () => {
    if (unfinishedSessions.length === 0) {
      return;
    }
    if (unfinishedSessions.length === 1) {
      navigate(`/game/${unfinishedSessions[0].id}`);
      return;
    }
    setPickerVisible(true);
  };

  const handleHistory = () => {
    navigate('/history');
  };

  const handleSessionSelect = (sessionId: string) => {
    setPickerVisible(false);
    navigate(`/game/${sessionId}`);
  };

  const formatTimestamp = (value?: string | null) => {
    if (!value) return 'Unknown time';
    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  };

  return (
    <>
      <Header onClearData={handleClearData} />
      <div
        className="flex-1 flex flex-col items-center px-6 pt-8 pb-12 md:px-8"
        style={{ backgroundColor: theme.background }}
      >
        {/* Hero Section */}
        <div className="w-full max-w-md text-center mb-6 animate-fade-in">
          <h1
            className="text-4xl md:text-5xl font-bold mb-3 mt-6"
            style={{ color: theme.titleText }}
          >
            Welcome to Farkle
          </h1>
          <p
            className="text-lg md:text-xl mb-6 opacity-80"
            style={{ color: theme.text }}
          >
            The classic dice game scorekeeper
          </p>
          
          {/* Dice Image with glow effect */}
          <div className="mb-6 flex justify-center">
            <div 
              className="rounded-2xl p-4 shadow-lg"
              style={{ 
                backgroundColor: theme.cardBackground,
                boxShadow: `0 8px 24px ${theme.shadowColor}`,
              }}
            >
              <img
                src="/assets/dice.png"
                alt="Dice"
                className="w-48 md:w-64 h-auto"
                style={{ objectFit: 'contain', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}
              />
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div
          className="w-full max-w-md animate-slide-up"
          style={{
            backgroundColor: theme.cardBackground,
            boxShadow: `0 4px 16px ${theme.shadowColor}`,
            borderRadius: '1.25rem',
            padding: '22px',
          }}
        >
          <div className="space-y-2.5">
            {!loadingSessions && unfinishedSessions.length > 0 && (
              <CustomButton
                title="Continue Game"
                onPress={handleContinueGame}
                style={{ width: '100%' }}
              />
            )}
            <CustomButton
              title="New Game"
              onPress={handleNewGame}
              style={{ width: '100%' }}
            />
            <CustomButton
              title="History"
              onPress={handleHistory}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      <Modal
        visible={pickerVisible}
        onRequestClose={() => setPickerVisible(false)}
        animationType="slide"
      >
        <div
          className="w-[90vw] max-w-md rounded-2xl p-6 space-y-4"
          style={{ backgroundColor: theme.cardBackground }}
        >
          <h3
            className="text-xl font-semibold"
            style={{ color: theme.titleText }}
          >
            Choose a game to continue
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {unfinishedSessions.map((session) => (
              <button
                key={session.id}
                onClick={() => handleSessionSelect(session.id)}
                className="w-full text-left p-4 rounded-xl border transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2"
                style={{
                  borderColor: theme.borderColor,
                  backgroundColor: theme.background,
                  color: theme.text,
                }}
              >
                <p className="font-semibold">
                  {session.players.join(', ') || 'Unnamed match'}
                </p>
                <p className="text-sm opacity-75">
                  Updated {formatTimestamp(session.updatedAt)}
                </p>
              </button>
            ))}
          </div>
          <CustomButton
            title="Cancel"
            onPress={() => setPickerVisible(false)}
            style={{ width: '100%' }}
          />
        </div>
      </Modal>
    </>
  );
};

export default HomePage;
