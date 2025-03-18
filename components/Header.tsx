// components/Header.tsx
import React, { useState, useContext } from 'react';
import {
  SafeAreaView,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  View,
  Modal,
  ScrollView,
} from 'react-native';
import CustomButton from './CustomButton';
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
import { Ionicons } from '@expo/vector-icons';

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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.primary }]}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={onPress} style={styles.titleContainer}>
          {/* Navigation title always white */}
          <Text style={[styles.headerTitle, { color: '#fff' }]}>Farkle</Text>
        </TouchableOpacity>
        <View style={styles.rightButtons}>
          {onClearData && (
            <TouchableOpacity onPress={onClearData} style={styles.clearButton}>
              <Text style={[styles.clearButtonText, { color: theme.primary }]}>
                Clear Data
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => setThemeModalVisible(true)}
            style={styles.gearButton}
          >
            <Ionicons name="settings-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      <Modal
        visible={themeModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setThemeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.modalBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.titleText }]}>
              Choose a Theme
            </Text>
            <ScrollView>
              {themes.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setTheme(item.theme);
                    setThemeModalVisible(false);
                  }}
                  style={[
                    styles.themeOption,
                    index !== themes.length - 1
                      ? {
                          borderBottomWidth: 1,
                          borderBottomColor: isDark
                            ? theme.secondary
                            : theme.secondary + '33',
                        }
                      : { borderBottomWidth: 0 },
                  ]}
                >
                  <Text
                    style={[
                      styles.themeOptionText,
                      { color: theme.text, textAlign: 'center' },
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <CustomButton
              title="Close"
              onPress={() => setThemeModalVisible(false)}
              style={styles.modalCloseButton}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#2E86C1',
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
  },
  headerContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {},
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#fff',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  gearButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  themeOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    width: '100%',
  },
  themeOptionText: {
    fontSize: 16,
  },
  modalCloseButton: {
    marginTop: 12,
    width: '100%',
  },
});

export default Header;
