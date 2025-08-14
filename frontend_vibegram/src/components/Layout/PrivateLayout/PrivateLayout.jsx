import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import SideBar from "../../common/Sidebar/Sidebar";
import Footer from "../../Footer/Footer";
import styles from "./PrivateLayout.module.css";

const PrivateLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Проверяем размер экрана
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth <= 480;
      setIsMobile(mobile);
      // На мобильных устройствах по умолчанию скрываем сайдбар
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Функция переключения сайдбара
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={styles.layout}>
      <SideBar 
        isOpen={isSidebarOpen}
        isMobile={isMobile}
        onToggle={toggleSidebar}
      />
      <div className={`${styles.content} ${!isSidebarOpen && !isMobile ? styles.contentFull : ''}`}>
        <Outlet /> {/* Основной контент */}
      </div>
      <Footer />
    </div>
  );
};

export default PrivateLayout;