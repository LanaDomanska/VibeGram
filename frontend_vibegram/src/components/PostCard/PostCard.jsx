// src/components/PostCard/PostCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import styles from "./PostCard.module.css";
import { API_URL } from "../../config";
import useLike from "@/hooks/useLike";

import LikeIcon from "../../assets/icons/like.svg";
import CommentIcon from "../../assets/icons/comment.svg";
import LikeFilledIcon from "../../assets/icons/likeFilled.png";
import DefaultAvatar from "../../assets/images/VibeGramLogo.png";

const PostCard = ({ post }) => {
  const postId = post._id;

  // единый хук лайка
  const { liked, likes, toggleLike } = useLike({
    postId,
    initialLiked: post.isLiked,
    initialLikes: post.likes,
  });

  // если не нужно открывать модал по клику на "коммент", тоже останавливаем всплытие
  const handleCommentClick = (e) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();
    // здесь твоя логика для комментариев (если понадобится)
  };

  const avatarSrc = post.author.avatar
    ? `${API_URL.replace(/\/+$/, "")}/${post.author.avatar.replace(/^\/+/, "")}`
    : DefaultAvatar;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
   <Link
     to={`/profile/${post.author.username}`}
     className={styles.authorLink}
     onClick={(e) => e.stopPropagation()}
   >
     <img src={avatarSrc} alt={post.author.username} className={styles.avatar} />
     <strong className={styles.username}>{post.author.username}</strong>
   </Link>
      </div>

      {/* по клику на изображение модалка всплывает в родителе — ничего не стопаем */}
      <img
        src={`${API_URL}${post.imageUrl}`}
        alt="post"
        className={styles.image}
      />

      <div className={styles.actions}>
        <img
          src={liked ? LikeFilledIcon : LikeIcon}
          alt="like"
          className={styles.icon + (liked ? ` ${styles.liked}` : "")}
          onClick={toggleLike}                // <- используем хук
          role="button"
          tabIndex={0}
          onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") ? toggleLike(e) : null
          }
          aria-pressed={liked}
        />
        <img
          src={CommentIcon}
          alt="comment"
          className={styles.icon}
          onClick={handleCommentClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") ? handleCommentClick(e) : null
          }
        />
      </div>

      <div className={styles.likes}>{likes} likes</div> {/* <- из хука */}
      <div className={styles.caption}>
        <strong className={styles.username}>{post.author.username}</strong>{" "}
        {post.caption}
      </div>

      {post.commentsCount > 0 && (
        <div className={styles.viewComments}>
          View all {post.commentsCount} comments
        </div>
      )}
    </div>
  );
};

export default PostCard;
