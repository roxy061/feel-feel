"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface TenantContextType {
  currentSubdomain: string;
  setCurrentSubdomain: (subdomain: string) => void;
}

const TenantContext = createContext<TenantContextType>({
  currentSubdomain: "techstore",
  setCurrentSubdomain: () => {},
});

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [currentSubdomain, setCurrentSubdomain] = useState("techstore");

  useEffect(() => {
    const saved = localStorage.getItem("selected_subdomain");
    if (saved) setCurrentSubdomain(saved);
  }, []);

  const handleSetSubdomain = (sub: string) => {
    setCurrentSubdomain(sub);
    localStorage.setItem("selected_subdomain", sub);
  };

  return (
    <TenantContext.Provider
      value={{ currentSubdomain, setCurrentSubdomain: handleSetSubdomain }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  return useContext(TenantContext);
}
