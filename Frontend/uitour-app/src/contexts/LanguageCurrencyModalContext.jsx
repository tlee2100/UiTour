import { createContext, useContext, useState } from 'react';

const LanguageCurrencyModalContext = createContext();

export function LanguageCurrencyModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <LanguageCurrencyModalContext.Provider
      value={{
        isOpen,
        openModal,
        closeModal
      }}
    >
      {children}
    </LanguageCurrencyModalContext.Provider>
  );
}

export function useLanguageCurrencyModal() {
  const context = useContext(LanguageCurrencyModalContext);
  if (context === undefined) {
    throw new Error('useLanguageCurrencyModal must be used within a LanguageCurrencyModalProvider');
  }
  return context;
}

