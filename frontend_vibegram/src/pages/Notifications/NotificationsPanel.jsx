import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";
import api from "../../api/axios";
import { API_URL } from "../../config";
import styles from "./NotificationsPanel.module.css";

/* helpers */
const FILES_ORIGIN = API_URL.replace(/\/api\/?$/, "");
const clean = (p) => String(p || "").replace(/^\/?public/, "").replace(/^\/+/, "");

const srcForUser = (u) => {
  const raw = u?.avatarUrl ?? u?.avatar ?? "";
  if (!raw) return "/img/avatar-placeholder.png";
  if (/^https?:\/\//i.test(raw)) return raw;
  return `${FILES_ORIGIN}/${clean(raw)}`;
};

const srcForPost = (post) => {
  const raw = post?.imageUrl ?? "";
  if (!raw) return "/img/post-placeholder.png";
  if (/^https?:\/\//i.test(raw)) return raw;
  return `${FILES_ORIGIN}/${clean(raw)}`;
};

export default function NotificationsPanel() {
  const { token } = useAuth();
  const { showNotification } = useNotification();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api
      .get("/notifications", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setNotifications(Array.isArray(res.data) ? res.data : []))
      .catch((err) =>
        showNotification(err?.response?.data?.message || err.message)
      );
  }, [token, showNotification]);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id ? { ...n, readAt: n.readAt || new Date().toISOString() } : n
        )
      );
    } catch (e) {
      // не критично
      console.error(e);
    }
  };

  const hrefForRight = (n) => {
    if ((n.type === "like" || n.type === "comment") && n.post?._id)
      return `/posts/${n.post._id}`;
    if (n.type === "message") return `/messages/${n.fromUser?._id}`;
    // follow (или резерв)
    return `/profile/${n.fromUser?.username}`;
  };

  const rightThumbSrc = (n) => {
    if ((n.type === "like" || n.type === "comment") && n.post) {
      return srcForPost(n.post);
    }
    // follow / message — показываем аватар отправителя
    return srcForUser(n.fromUser);
  };

  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>Notifications</h2>
      <p className={styles.subTitle}>New</p>

      <ul className={styles.list}>
        {notifications.map((n) => {
          const from = n.fromUser || {};
          const avatarSrc = srcForUser(from);
          const postHref =
            n.post?._id && (n.type === "like" || n.type === "comment")
              ? `/posts/${n.post._id}`
              : null;

          return (
            <li
              key={n._id}
              className={`${styles.item} ${n.readAt ? "" : styles.unread}`}
              onClick={() => markRead(n._id)}
            >
              {/* аватар слева */}
              <Link
                to={`/profile/${from.username}`}
                onClick={(e) => {
                  e.stopPropagation();
                  markRead(n._id);
                }}
                className={styles.avatarLink}
              >
                <img
                  src={avatarSrc}
                  alt={from.username}
                  className={styles.avatar}
                  onError={(e) => {
                    if (!/avatar-placeholder/.test(e.currentTarget.src)) {
                      e.currentTarget.src = "/img/avatar-placeholder.png";
                    }
                  }}
                />
              </Link>

              {/* текст */}
              <div className={styles.text}>
                <Link
                  to={`/profile/${from.username}`}
                  className={styles.username}
                  onClick={(e) => {
                    e.stopPropagation();
                    markRead(n._id);
                  }}
                >
                  {from.username}
                </Link>{" "}
                {n.type === "like" && (
                  <>
                    liked your photo.{" "}
                    {postHref && (
                      <Link
                        to={postHref}
                        className={styles.viewLink}
                        onClick={(e) => {
                          e.stopPropagation();
                          markRead(n._id);
                        }}
                      >
                        View
                      </Link>
                    )}
                  </>
                )}
                {n.type === "comment" && (
                  <>
                    commented on your photo.{" "}
                    {postHref && (
                      <Link
                        to={postHref}
                        className={styles.viewLink}
                        onClick={(e) => {
                          e.stopPropagation();
                          markRead(n._id);
                        }}
                      >
                        View
                      </Link>
                    )}
                  </>
                )}
                {n.type === "follow" && <>started following you.</>}
                {n.type === "message" && <>sent you a message.</>}

                <div className={styles.time}>
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </div>
              </div>

              {/* превью справа: пост для like/comment; аватар для follow/message */}
              <Link
                to={hrefForRight(n)}
                className={styles.thumbLink}
                onClick={(e) => {
                  e.stopPropagation();
                  markRead(n._id);
                }}
              >
                <img
                  src={rightThumbSrc(n)}
                  alt="preview"
                  className={styles.thumb}
                  onError={(e) => {
                    if (!/placeholder/.test(e.currentTarget.src)) {
                      e.currentTarget.src =
                        n.type === "like" || n.type === "comment"
                          ? "/img/post-placeholder.png"
                          : "/img/avatar-placeholder.png";
                    }
                  }}
                />
              </Link>
            </li>
          );
        })}
      </ul>

      <div className={styles.footer}>
        <span className={styles.footerIcon}>✔︎</span>
        <span className={styles.footerText}>You’ve seen all the updates</span>
      </div>
    </div>
  );
}
