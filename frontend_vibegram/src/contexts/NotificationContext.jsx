import { createContext, useContext, useState } from "react";

// 1. Создаем сам контекст
const NotificationContext = createContext();

// 2. Провайдер — то, что будет оборачивать App
export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000); // очищаем через 3 сек
  };

  return (
    <NotificationContext.Provider value={{ notification, showNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

// 3. Хук для удобного доступа к контексту
export const useNotification = () => useContext(NotificationContext);
