// components/Header.tsx
import React, { useState, useContext } from 'react';
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

interface HeaderProps {
  onPress?: () => void;
  onClearData?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onPress, onClearData }) => {
  const { theme, setTheme } = useContext(ThemeContext);
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
      className="w-full"
      style={{
        backgroundColor: theme.primary,
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      <div className="flex flex-row py-3 px-4 items-center justify-between">
        <button onClick={onPress} className="flex-1 text-left">
          <h1 className="text-2xl font-bold text-white">Farkle</h1>
        </button>
        <div className="flex flex-row items-center">
          {onClearData && (
            <button
              onClick={onClearData}
              className="bg-white py-1 px-2 rounded text-sm font-semibold mr-2"
              style={{ color: theme.primary }}
            >
              Clear Data
            </button>
          )}
          <button
            onClick={() => setThemeModalVisible(true)}
            className="p-1 text-white"
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
          className="w-[80%] rounded-lg p-4 flex flex-col items-center"
          style={{ backgroundColor: theme.modalBackground }}
        >
          <h2
            className="text-xl font-bold mb-3"
            style={{ color: theme.titleText }}
          >
            Choose a Theme
          </h2>
          <div className="w-full max-h-96 overflow-y-auto">
            {themes.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  setTheme(item.theme);
                  setThemeModalVisible(false);
                }}
                className={`w-full py-2 px-3 text-left ${
                  index !== themes.length - 1
                    ? isDark
                      ? 'border-b'
                      : 'border-b border-opacity-20'
                    : ''
                }`}
                style={{
                  borderBottomColor:
                    index !== themes.length - 1
                      ? isDark
                        ? theme.secondary
                        : theme.secondary + '33'
                      : 'transparent',
                }}
              >
                <span
                  className="text-base text-center block w-full"
                  style={{ color: theme.text }}
                >
                  {item.name}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-3 w-full">
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
