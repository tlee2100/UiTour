import { createContext, useContext, useState, useEffect } from "react";
import { registerSetIsLoading } from "./GlobalLoadingContextHelper";

const GlobalLoadingContext = createContext();

export function GlobalLoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    registerSetIsLoading(setIsLoading);
  }, []);

  return (
    <GlobalLoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
    </GlobalLoadingContext.Provider>
  );
}

export const useGlobalLoading = () => useContext(GlobalLoadingContext);
