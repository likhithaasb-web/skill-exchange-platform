import React, { createContext, useContext, useState } from 'react';

interface SettingsDrawerContextType {
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  toggleSettings: () => void;
}

const SettingsDrawerContext = createContext<SettingsDrawerContextType>({
  isSettingsOpen: false,
  openSettings: () => {},
  closeSettings: () => {},
  toggleSettings: () => {},
});

export const SettingsDrawerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <SettingsDrawerContext.Provider
      value={{
        isSettingsOpen,
        openSettings: () => setIsSettingsOpen(true),
        closeSettings: () => setIsSettingsOpen(false),
        toggleSettings: () => setIsSettingsOpen(prev => !prev),
      }}
    >
      {children}
    </SettingsDrawerContext.Provider>
  );
};

export const useSettingsDrawer = () => useContext(SettingsDrawerContext);
