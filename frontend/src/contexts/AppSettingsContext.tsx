import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AppSettings {
  darkMode: boolean;
  locale: string;
  // Add other settings here
}

interface AppSettingsContextType {
  settings: AppSettings;
  updateSetting: (key: string, value: any) => void;
  updateNestedSetting: (section: string, key: string, value: any) => void;
  toggleDarkMode: () => void;
}

const defaultSettings: AppSettings = {
  darkMode: true,
  locale: 'fr-FR',
  // Default values for other settings













  
};

console.log('Default settings:', defaultSettings);

const AppSettingsContext = createContext<AppSettingsContextType>({
  settings: defaultSettings,
  updateSetting: () => {},
  updateNestedSetting: () => {},
  toggleDarkMode: () => {},
});

export const useAppSettings = () => useContext(AppSettingsContext);

interface AppSettingsProviderProps {
  children: ReactNode;
}

export const AppSettingsProvider: React.FC<AppSettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    // Load settings from localStorage or use defaults
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        console.log('Loaded settings from localStorage:', parsedSettings);
        return parsedSettings;
      } catch {
        console.log('Failed to parse settings from localStorage, using defaults');
        return defaultSettings;
      }
    }
    
    // Default to dark mode as requested
    console.log('Using default settings (dark mode):', defaultSettings);
    return defaultSettings;
  });

  // Apply theme class to document element when darkMode changes
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
      console.log('Dark class applied to document element');
    } else {
      document.documentElement.classList.remove('dark');
      console.log('Dark class removed from document element');
    }
    console.log('Current document classes:', document.documentElement.classList);
    
    // Save settings to localStorage
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings.darkMode]);

  const updateSetting = (key: string, value: any) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [key]: value,
    }));
  };

  const toggleDarkMode = () => {
    setSettings(prevSettings => ({
      ...prevSettings,
      darkMode: !prevSettings.darkMode,
    }));
  };

  // Fix the updateNestedSetting function with proper typing
  const updateNestedSetting = (section: string, key: string, value: any) => {
    setSettings((prevSettings) => {
      // Create a copy of the current settings
      const updatedSettings = { ...prevSettings };
      
      // Safely handle the nested section
      const sectionData = updatedSettings[section] as Record<string, any>;
      
      // If the section exists, update it
      if (sectionData) {
        // Create a new object for the section to avoid direct mutation
        updatedSettings[section] = {
          ...sectionData,
          [key]: value
        };
      }
      
      return updatedSettings;
    });
  };

  return (
    <AppSettingsContext.Provider value={{ settings, updateSetting, updateNestedSetting, toggleDarkMode }}>
      {children}
    </AppSettingsContext.Provider>
  );
};
