import React from "react";
import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <nav className={styles.nav}>
          <a href="/privacy" className={styles.link}>
            Home
          </a>
          <a href="/terms" className={styles.link}>
            Search
          </a>
          <a href="/contact" className={styles.link}>
            Explore
          </a>
          <a href="/contact" className={styles.link}>
            Messages
          </a>
          <a href="/contact" className={styles.link}>
            Notificaitons
          </a>
          <a href="/contact" className={styles.link}>
            Create
          </a>
        </nav>
        <p className={styles.copyright}>© {new Date().getFullYear()} ICHgram</p>
      </div>
    </footer>
  );
};

export default Footer;
