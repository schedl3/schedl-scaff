import React, { ReactNode, createContext, useContext, useEffect, useState } from "react";

interface JwtContextValue {
  jwt: string | null;
  setJwt: (token: string | null) => void;
}

const JwtContext = createContext<JwtContextValue | undefined>(undefined);

const useJwtContext = () => {
  const context = useContext(JwtContext);
  if (!context) {
    throw new Error("useJwtContext must be used within a JwtProvider");
  }
  return context;
};

interface JwtProviderProps {
  children: ReactNode; // Requires children prop as ReactNode
}

const JwtProvider: React.FC<JwtProviderProps> = ({ children }) => {
  const [jwt, setJwt] = useState<string | null>(null);

  useEffect(() => {
    const tokenFromStorage = localStorage.getItem("jwt");
    if (!tokenFromStorage) {
      return;
    }
    setJwt(tokenFromStorage);
  }, []);

  useEffect(() => {
    localStorage.setItem("jwt", jwt || "");
  }, [jwt]);

  const value: JwtContextValue = {
    jwt,
    setJwt,
  };

  return <JwtContext.Provider value={value}>{children}</JwtContext.Provider>;
};

export { JwtProvider, useJwtContext };
