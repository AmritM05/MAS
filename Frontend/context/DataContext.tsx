"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface DataContextType {
  metrics: any;
  setMetrics: (d: any) => void;
  plan: any;
  setPlan: (p: any) => void;
  uploaded: boolean;
  cashBalance: number;
  setCashBalance: (n: number) => void;
}

const DataContext = createContext<DataContextType>({
  metrics: null,
  setMetrics: () => {},
  plan: null,
  setPlan: () => {},
  uploaded: false,
  cashBalance: 400000,
  setCashBalance: () => {},
});

export function DataProvider({ children }: { children: ReactNode }) {
  const [metrics, setMetrics] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [cashBalance, setCashBalance] = useState<number>(400000);

  return (
    <DataContext.Provider
      value={{
        metrics,
        setMetrics,
        plan,
        setPlan,
        uploaded: !!metrics,
        cashBalance,
        setCashBalance,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
