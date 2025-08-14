// src/components/common/Sidebar/Sidebar.jsx

import React, { useState } from "react";
import {
  HomeIcon,
  SearchIcon,
  ExploreIcon,
  MessageIcon,
  NotificationsIcon,
  CreateIcon,
  ProfileIcon,
} from "../../../assets/icons/Icons";
import SettingsIcon from "@mui/icons-material/Settings";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

import CreatePostModal from "../../modals/CreatePostModal";
import NotificationsPanel from "../../../pages/Notifications/NotificationsPanel";
import SearchPanel from "../../common/panels/SearchPanel";
import SettingsModal from "../../modals/SettingsModal";
import VibeGram from "../../../assets/images/VibeGram.png";
// import defaultAvatar from "/images/default-avatar.png"; // путь к твоему файлу



import styles from "./Sidebar.module.css";
const defaultAvatar = "/images/default-avatar.png";
const Sidebar = () => {
  const [activeItem, setActiveItem] = useState("home");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  const handleItemClick = (item) => {
    setActiveItem(item.id);

    if (item.id === "settings") {
      setIsSettingsOpen(true);
      setIsCreateModalOpen(false);
      setIsNotifOpen(false);
      setIsSearchOpen(false);
      return;
    }

    if (item.id === "create") {
      setIsCreateModalOpen(true);
      setIsNotifOpen(false);
      setIsSearchOpen(false);
    } else if (item.id === "notifications") {
      setIsNotifOpen((prev) => !prev);
      setIsSearchOpen(false);
    } else if (item.id === "search") {
      setIsSearchOpen((prev) => !prev);
      setIsNotifOpen(false);
    } else {
      setIsNotifOpen(false);
      setIsSearchOpen(false);
      navigate(item.path);
    }
  };

  const menuItems = [
    { icon: <HomeIcon />, label: "Home", id: "home", path: "/" },
    { icon: <SearchIcon />, label: "Search", id: "search", path: null },
    { icon: <ExploreIcon />, label: "Explore", id: "explore", path: "/explore" },
    { icon: <MessageIcon />, label: "Messages", id: "messages", path: "/messages" },
    { icon: <NotificationsIcon />, label: "Notifications", id: "notifications", path: null },
    { icon: <CreateIcon />, label: "Create", id: "create", path: null },
    {
      icon: <ProfileIcon />,
      label: "Profile",
      id: "profile",
      path: user ? `/profile/${user.username}` : "/profile",
    },
    { icon: <SettingsIcon />, label: "Settings", id: "settings", path: null },
  ];
const getAvatarUrl = (avatar) => {
  if (!avatar) return defaultAvatar;
  return avatar.startsWith('http') ? avatar : `http://localhost:3000${avatar}`;
};
  return (
    <>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
  <img src={VibeGram} alt="VibeGram" className={styles.logoImg} />
</div>

        <nav>
          <ul className={styles.menu}>
            {menuItems.map((item) => {
              // Подменяем иконку профиля на аватар пользователя, если он авторизован и у него есть аватар
             const iconElement =
  item.id === "profile" ? (
<img
  src={getAvatarUrl(user?.avatar)}
  alt="avatar"
  className={styles.avatarIcon}
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = defaultAvatar;
  }}
/>
  ) : (
    item.icon
  );


              return (
                <li
                  key={item.id}
                  className={`${styles.menuItem} ${
                    activeItem === item.id ? styles.active : ""
                  }`}
                  onClick={() => handleItemClick(item)}
                >
                  {item.path ? (
                    <Link to={item.path} className={styles.link}>
                      <span className={styles.icon}>{iconElement}</span>
                      <span>{item.label}</span>
                    </Link>
                  ) : (
                    <div className={styles.link}>
                      <span className={styles.icon}>{iconElement}</span>
                      <span>{item.label}</span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Notifications Panel */}
      {isNotifOpen && (
        <>
          <div className={styles.panelWrapper}>
            <NotificationsPanel />
          </div>
          <div
            className={styles.backdrop}
            onClick={() => setIsNotifOpen(false)}
          />
        </>
      )}

      {/* Search Panel */}
      {isSearchOpen && (
        <>
          <div className={styles.panelWrapper}>
            <SearchPanel />
          </div>
          <div
            className={styles.backdrop}
            onClick={() => setIsSearchOpen(false)}
          />
        </>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
};

export default Sidebar;
