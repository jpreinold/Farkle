// components/Header.tsx
import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoMdSettings } from 'react-icons/io';
import CustomButton from './CustomButton';
import Modal from './Modal';
import {
  ThemeContext,
  lightTheme,
  darkTheme,
  oceanBreezeTheme,
  sunsetGlowTheme,
  purpleTheme,
  greenTheme,
  pinkTheme,
} from './ThemeContext';
import storage from '../utils/storage';

interface HeaderProps {
  onClearData?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onClearData }) => {
  const { theme, setTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleHeaderPress = () => {
    navigate('/');
  };

  const handleClearData = async () => {
    if (onClearData) {
      onClearData();
    } else {
      // Fallback if onClearData not provided
      try {
        await storage.clear();
        console.log('Local storage cleared.');
      } catch (error) {
        console.error('Error clearing local storage:', error);
      }
    }
  };

  // Only show Clear Data button on home page
  const showClearData = location.pathname === '/';
  const [themeModalVisible, setThemeModalVisible] = useState(false);

  const themes = [
    { name: 'Light Mode', theme: lightTheme },
    { name: 'Dark Mode', theme: darkTheme },
    { name: 'Ocean Breeze', theme: oceanBreezeTheme },
    { name: 'Sunset Glow', theme: sunsetGlowTheme },
    { name: 'Mystic Amethyst', theme: purpleTheme },
    { name: 'Emerald Grove', theme: greenTheme },
    { name: 'Sugar Pink', theme: pinkTheme },
  ];

  // Determine if the current theme is dark by comparing primary color values.
  const isDark = theme.primary === darkTheme.primary;

  return (
    <div
      className="w-full shadow-md relative"
      style={{
        background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      <div className="flex flex-row py-4 px-6 items-center justify-between">
        <button 
          onClick={handleHeaderPress} 
          className="flex-1 text-left transition-transform duration-200 hover:scale-105"
        >
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">Farkle</h1>
        </button>
        <div className="flex flex-row items-center gap-3">
          {showClearData && (
            <button
              onClick={handleClearData}
              className="bg-white/20 backdrop-blur-sm py-2 px-4 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:bg-white/30 hover:shadow-md active:scale-95"
            >
              Clear Data
            </button>
          )}
          <button
            onClick={() => setThemeModalVisible(true)}
            className="p-2 text-white rounded-lg transition-all duration-200 hover:bg-white/20 hover:scale-110 active:scale-95"
            aria-label="Settings"
          >
            <IoMdSettings size={28} />
          </button>
        </div>
      </div>
      <Modal
        visible={themeModalVisible}
        onRequestClose={() => setThemeModalVisible(false)}
        animationType="slide"
      >
        <div
          className="w-[85%] max-w-md rounded-2xl p-6 flex flex-col items-center shadow-2xl"
          style={{ backgroundColor: theme.cardBackground }}
        >
          <h2
            className="text-2xl font-bold mb-6"
            style={{ color: theme.titleText }}
          >
            Choose a Theme
          </h2>
          <div className="w-full max-h-96 overflow-y-auto space-y-2">
            {themes.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  setTheme(item.theme);
                  setThemeModalVisible(false);
                }}
                className={`w-full py-3 px-4 rounded-lg text-left transition-all duration-200 ${
                  theme.primary === item.theme.primary
                    ? 'ring-2 ring-offset-2'
                    : 'hover:bg-opacity-10'
                }`}
                style={{
                  backgroundColor: theme.primary === item.theme.primary 
                    ? `${item.theme.secondary}40` 
                    : 'transparent',
                  borderBottom: index !== themes.length - 1
                    ? `1px solid ${isDark ? theme.secondary : theme.borderColor}`
                    : 'none',
                  ringColor: item.theme.secondary,
                }}
              >
                <span
                  className="text-base font-medium block w-full"
                  style={{ color: theme.text }}
                >
                  {item.name}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-6 w-full">
            <CustomButton
              title="Close"
              onPress={() => setThemeModalVisible(false)}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Header;
