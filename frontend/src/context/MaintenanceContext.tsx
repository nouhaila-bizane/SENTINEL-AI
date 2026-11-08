import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '../services/api';

interface MaintenanceContextType {
  isMaintenanceMode: boolean;
  maintenanceMessage: string;
  loading: boolean;
}

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

export const MaintenanceProvider = ({ children }: { children: ReactNode }) => {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const checkStatus = async () => {
    try {
      const { data } = await api.get('/maintenance/status');
      setIsMaintenanceMode(data.maintenanceMode);
      setMaintenanceMessage(data.maintenanceMessage);
    } catch (error) {
      // If API is down, assume maintenance to be safe
      setIsMaintenanceMode(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <MaintenanceContext.Provider value={{ isMaintenanceMode, maintenanceMessage, loading }}>
      {children}
    </MaintenanceContext.Provider>
  );
};

export const useMaintenance = () => {
  const ctx = useContext(MaintenanceContext);
  if (!ctx) throw new Error('useMaintenance must be used inside MaintenanceProvider');
  return ctx;
};