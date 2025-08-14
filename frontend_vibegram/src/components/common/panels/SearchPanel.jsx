import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import api from "@/api/axios.js";
import { API_URL } from "@/config";
import styles from "./SearchPanel.module.css";

import DefaultAvatar from "@/assets/images/VibeGramLogo.png";

export default function SearchPanel() {
  const { token } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const FILES_ORIGIN = API_URL.replace(/\/api\/?$/, "");

  const srcFor = (u) => {
    const raw =
      u?.avatarUrl ??
      u?.avatar ??
      u?.profile?.avatar ??
      u?.photo ??
      u?.image ??
      u?.author?.avatar ??
      "";
    if (!raw) return DefaultAvatar;
    if (/^https?:\/\//i.test(raw)) return raw;
    const FILES_ORIGIN = API_URL.replace(/\/api\/?$/, "");
    const clean = String(raw).replace(/^\/+/, "");
    return `${FILES_ORIGIN}/${clean}`;
  };

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    const handler = setTimeout(() => {
      api
        .get("/search", {
          params: { query },
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        })
        .then(({ data, headers }) => {
          const ct = headers?.["content-type"] || "";
          if (!ct.includes("application/json")) return setResults([]);
          setResults(Array.isArray(data) ? data : []);
        })
        .catch(() => setResults([]));
    }, 300);

    return () => clearTimeout(handler);
  }, [query, token]);

  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>Search</h2>
      <input
        className={styles.searchInput}
        type="text"
        placeholder="Search by username…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <ul className={styles.list}>
        {results.map((u) => (
          <li key={u._id} className={styles.item}>
            <Link to={`/profile/${u.username}`} className={styles.link}>
              <img
                src={srcFor(u)}
                alt={u.username}
                className={styles.avatar}
                onError={(e) => {
                  if (e.currentTarget.src !== DefaultAvatar) {
                    e.currentTarget.src = DefaultAvatar;
                  }
                }}
              />
              <span className={styles.username}>{u.username}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
