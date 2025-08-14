// // src/components/modals/NotificationsDropdown/NotificationsDropdown.jsx
// import React, { useState, useRef, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { formatDistanceToNow } from "date-fns";
// import { useAuth } from "../../contexts/AuthContext";
// import {
//   HomeIcon,
//   SearchIcon,
//   ExploreIcon,
//   MessageIcon,
//   NotificationsIcon,
//   CreateIcon,
//   ProfileIcon,
// } from "../../../assets/icons/icons"; // для примера, если нужна иконка

// import styles from "./NotificationsDropdown.module.css";

// export default function NotificationsDropdown({ isOpen, onClose }) {
//   const { token } = useAuth();
//   const [notifications, setNotifications] = useState([]);
//   const ref = useRef(null);

//   // Загрузка уведомлений при открытии
//   useEffect(() => {
//     if (!isOpen) return;
//     fetch("/api/notifications", {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then(res => {
//         if (!res.ok) throw new Error("Не удалось загрузить уведомления");
//         return res.json();
//       })
//       .then(setNotifications)
//       .catch(console.error);
//   }, [isOpen, token]);

//   // Закрытие при клике вне
//   useEffect(() => {
//     if (!isOpen) return;
//     const onClickOutside = e => {
//       if (ref.current && !ref.current.contains(e.target)) {
//         onClose();
//       }
//     };
//     document.addEventListener("mousedown", onClickOutside);
//     return () => document.removeEventListener("mousedown", onClickOutside);
//   }, [isOpen, onClose]);

//   if (!isOpen) return null;

//   return (
//     <div className={styles.panel} ref={ref}>
//       <h2 className={styles.title}>Notifications</h2>
//       <p className={styles.subTitle}>New</p>

//       <ul className={styles.list}>
//         {notifications.map(n => (
//           <li
//             key={n._id}
//             className={`${styles.item} ${n.read ? "" : styles.unread}`}
//             onClick={() => {
//               fetch(`/api/notifications/${n._id}/read`, {
//                 method: "PUT",
//                 headers: { Authorization: `Bearer ${token}` },
//               });
//               setNotifications(prev =>
//                 prev.map(x =>
//                   x._id === n._id ? { ...x, read: true } : x
//                 )
//               );
//             }}
//           >
//             <Link to={`/profile/${n.fromUser.username}`}>
//               <img
//                 src={n.fromUser.avatarUrl}
//                 alt={n.fromUser.username}
//                 className={styles.avatar}
//               />
//             </Link>
//             <div className={styles.text}>
//               <Link
//                 to={`/profile/${n.fromUser.username}`}
//                 className={styles.username}
//               >
//                 {n.fromUser.username}
//               </Link>
//               {n.type === "like" && (
//                 <>
//                   liked your photo.{" "}
//                   <Link to={`/p/${n.post?._id}`}>View</Link>
//                 </>
//               )}
//               {n.type === "comment" && (
//                 <>
//                   commented on your photo.{" "}
//                   <Link to={`/p/${n.post?._id}`}>View</Link>
//                 </>
//               )}
//               {n.type === "follow" && "started following you."}
//               {n.type === "message" && "sent you a message."}
//               <div className={styles.time}>
//                 {formatDistanceToNow(new Date(n.createdAt), {
//                   addSuffix: true,
//                 })}
//               </div>
//             </div>
//             {n.type === "follow" && (
//               <button className={styles.followBtn}>Follow Back</button>
//             )}
//           </li>
//         ))}
//       </ul>

//       <div className={styles.footer}>
//         <span className={styles.footerIcon}>✔︎</span>
//         <span className={styles.footerText}>
//           You’ve seen all the updates
//         </span>
//       </div>
//     </div>
//   );
// }
