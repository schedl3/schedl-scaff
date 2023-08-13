import React, { ReactNode, createContext, useContext, useEffect, useState } from "react";
import jwt from "jsonwebtoken";

interface DecodedToken {
  exp: number; // Expiration timestamp
  // ignore other claims
}

function isTokenExpired(token: string): boolean {
  try {
    const decodedToken: DecodedToken = jwt.decode(token) as DecodedToken;
    const currentTime = Date.now() / 1000;
    console.log("Decoded token:", decodedToken.exp, "Current time:", currentTime);
    return decodedToken.exp < currentTime;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true; // Assuming an error means the token is expired
  }
}

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
    !isTokenExpired(tokenFromStorage) && setJwt(tokenFromStorage);
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
