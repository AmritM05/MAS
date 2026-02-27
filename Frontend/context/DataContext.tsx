"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface DataContextType {
  metrics: any;
  setMetrics: (d: any) => void;
  plan: any;
  setPlan: (p: any) => void;
  uploaded: boolean;
}

const DataContext = createContext<DataContextType>({
  metrics: null,
  setMetrics: () => {},
  plan: null,
  setPlan: () => {},
  uploaded: false,
});

export function DataProvider({ children }: { children: ReactNode }) {
  const [metrics, setMetrics] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);

  return (
    <DataContext.Provider
      value={{
        metrics,
        setMetrics,
        plan,
        setPlan,
        uploaded: !!metrics,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
