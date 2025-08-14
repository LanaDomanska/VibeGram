import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./PostModal.module.css";
import api from "../../api/axios";
import { API_URL } from "../../config";
import moreIcon from "../../assets/icons/more.svg";
import heartIcon from "../../assets/icons/heart.svg";
import LikeFilledIcon from "../../assets/icons/likeFilled.png";
import commentIcon from "../../assets/icons/comment.svg";
import commentLike from "../../assets/icons/commentLike.png";          
import commentLikeFilled from "../../assets/icons/commentLikeFilled.png"; 
import emojiIcon from "../../assets/icons/emoji.svg";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import PostActionsModal from "./PostActionsModal";
import DefaultAvatar from "../../assets/images/VibeGramLogo.png";
import useLike from "@/hooks/useLike";


const FILES_ORIGIN = API_URL.replace(/\/api\/?$/, "");
const clean = (p) =>
  String(p || "")
    .replace(/^\/?public/, "")
    .replace(/^\/+/, "");

const srcForUser = (u) => {
  const raw = u?.avatarUrl ?? u?.avatar ?? "";
  if (!raw) return DefaultAvatar;
  if (/^https?:\/\//i.test(raw)) return raw;
  return `${FILES_ORIGIN}/${clean(raw)}`;
};

const RTF = new Intl.RelativeTimeFormat(
  (navigator.language || "ru").toLowerCase().startsWith("ru") ? "ru" : "en",
  { numeric: "auto" }
);
function timeAgo(date, now = Date.now()) {
  const ts = new Date(date).getTime();
  if (Number.isNaN(ts)) return "";
  const diffSec = Math.round((ts - now) / 1000);
  const abs = Math.abs(diffSec);
  if (abs < 60) return RTF.format(diffSec, "second");
  const min = Math.round(diffSec / 60);
  if (Math.abs(min) < 60) return RTF.format(min, "minute");
  const hr = Math.round(min / 60);
  if (Math.abs(hr) < 24) return RTF.format(hr, "hour");
  const day = Math.round(hr / 24);
  if (Math.abs(day) < 7) return RTF.format(day, "day");
  const wk = Math.round(day / 7);
  if (Math.abs(wk) < 4) return RTF.format(wk, "week");
  const mon = Math.round(day / 30);
  if (Math.abs(mon) < 12) return RTF.format(mon, "month");
  const yr = Math.round(day / 365);
  return RTF.format(yr, "year");
}


export default function PostModal({ post, onClose, onDeleted }) {
  const [p, setP] = useState(post);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [sending, setSending] = useState(false);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setP(post);
    const needsAuthor = !post?.author?.avatar && !post?.author?.avatarUrl;
    if (post?._id && needsAuthor) {
      api
        .get(`/posts/${post._id}`)
        .then((res) => {
          const full = res.data?.post || res.data;
          if (full?._id) setP(full);
        })
        .catch(() => {});
    }
  }, [post]);

  useEffect(() => {
    if (post?._id) {
      api
        .get(`/comments/${post._id}`)
        .then((res) => setComments(Array.isArray(res.data) ? res.data : []))
        .catch((err) => console.error("Ошибка загрузки комментариев", err));
    }
  }, [post?._id]);

  if (!p) return null;

  const { liked, likes, toggleLike } = useLike({
    postId: p?._id,
    initialLiked: p?.isLiked,
    initialLikes: p?.likes,
    onChange: (v) => setP((prev) => (prev ? { ...prev, ...v } : prev)),
  });

  const avatarSrc = srcForUser(p.author);

  const imageSrc = useMemo(() => {
    const raw = p.imageUrl || "";
    if (/^https?:\/\//i.test(raw)) return raw;
    return `${FILES_ORIGIN}/${clean(raw)}`;
  }, [p.imageUrl]);

  const submitComment = async (e) => {
    e?.preventDefault?.();
    const txt = comment.trim();
    if (!txt || sending || !p?._id) return;

    setSending(true);
    try {
      const res = await api.post(`/comments/${p._id}`, { text: txt });
      const created = res.data?.comment || res.data;
      if (created && created._id) {
        setComments((prev) => [...prev, created]);
      } else {
        const ref = await api.get(`/comments/${p._id}`);
        setComments(Array.isArray(ref.data) ? res.data : []);
      }
      setComment("");
      setShowEmojiPicker(false);
      setP((prev) =>
        prev ? { ...prev, commentsCount: (prev.commentsCount ?? 0) + 1 } : prev
      );
    } catch {
      try {
        await api.post(`/comments`, { postId: p._id, text: txt });
        const ref = await api.get(`/comments/${p._id}`);
        setComments(Array.isArray(ref.data) ? ref.data : []);
        setComment("");
        setShowEmojiPicker(false);
        setP((prev) =>
          prev ? { ...prev, commentsCount: (prev.commentsCount ?? 0) + 1 } : prev
        );
      } catch (e2) {
        console.error("Ошибка отправки комментария:", e2);
      }
    } finally {
      setSending(false);
    }
  };

  const toggleCommentLike = async (e, commentId) => {
    e?.stopPropagation?.();
    const current = comments.find((x) => x._id === commentId);
    if (!current) return;

    const wasLiked = !!current.isLiked;
    const next = !wasLiked;

    setComments((prev) =>
      prev.map((x) =>
        x._id === commentId
          ? { ...x, isLiked: next, likes: (x.likes || 0) + (next ? 1 : -1) }
          : x
      )
    );

    try {
      const fn = next ? api.post : api.delete;
      await fn(`/comment-likes/${commentId}`);
    } catch (err) {
      setComments((prev) =>
        prev.map((x) =>
          x._id === commentId
            ? { ...x, isLiked: wasLiked, likes: (x.likes || 0) + (next ? -1 : 1) }
            : x
        )
      );
      console.error("comment like error:", err?.response?.data || err?.message);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/posts/${p._id}`);
      setShowActions(false);
      onClose();
      onDeleted?.();
    } catch (err) {
      console.error("Ошибка удаления поста", err);
    }
  };

  const handleEdit = () => {
    setShowActions(false);
    navigate(`/edit-post/${p._id}`);
  };

  const handleGoToPost = () => {
    setShowActions(false);
    navigate(`/posts/${p._id}`);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/posts/${p._id}`;
    navigator.clipboard.writeText(link);
    setShowActions(false);
  };

  const handleEmojiSelect = (emoji) => {
    setComment((prev) => prev + emoji.native);
  };

  const focusCommentInput = (e) => {
    e?.stopPropagation?.();
    inputRef.current?.focus();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Изображение */}
        <div className={styles.imageBox}>
          <img src={imageSrc} alt="post" className={styles.image} />
        </div>

        {/* Инфа о посте */}
        <div className={styles.info}>
          {/* Шапка */}
          <div className={styles.header}>
            <Link
              to={`/profile/${p.author.username}`}
              className={styles.authorLink}
              onClick={(e) => {
                e.stopPropagation();
                onClose?.();
              }}
            >
              <img
                src={avatarSrc}
                alt={p.author.username}
                className={styles.avatar}
                onError={(e) => {
                  if (e.currentTarget.src !== DefaultAvatar) {
                    e.currentTarget.src = DefaultAvatar;
                  }
                }}
              />
              <span className={styles.username}>{p.author.username}</span>
            </Link>
            <img
              src={moreIcon}
              alt="options"
              className={styles.moreIcon}
              onClick={() => setShowActions(true)}
            />
          </div>

          <div className={styles.headerDivider} />

          <div className={styles.captionBlock}>
            <Link
              to={`/profile/${p.author.username}`}
              className={styles.captionAuthor}
              onClick={(e) => {
                e.stopPropagation();
                onClose?.();
              }}
            >
              <img
                src={avatarSrc}
                alt={p.author.username}
                className={styles.captionAvatar}
                onError={(e) => {
                  if (e.currentTarget.src !== DefaultAvatar) {
                    e.currentTarget.src = DefaultAvatar;
                  }
                }}
              />
            </Link>

            <div className={styles.captionBody}>
              <Link
                to={`/profile/${p.author.username}`}
                className={styles.username}
                onClick={(e) => {
                  e.stopPropagation();
                  onClose?.();
                }}
              >
                <b>{p.author.username}</b>
              </Link>
              <span className={styles.caption}>{p.caption}</span>
            </div>
          </div>

          <div className={styles.comments}>
            {comments.map((c) => {
              const au = c.author || {};
              const uname = au.username || "user";
              const cAvatar = srcForUser(au);
              return (
                <div className={styles.comment} key={c._id}>
                  <Link
                    to={`/profile/${uname}`}
                    className={styles.commentAuthor}
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose?.();
                    }}
                  >
                    <img
                      src={cAvatar}
                      alt={uname}
                      className={styles.commentAvatar}
                      onError={(e) => {
                        if (e.currentTarget.src !== DefaultAvatar) {
                          e.currentTarget.src = DefaultAvatar;
                        }
                      }}
                    />
                  </Link>

                  <div className={styles.commentBody}>
                    <div className={styles.commentHeaderRow}>
                      <Link
                        to={`/profile/${uname}`}
                        className={styles.username}
                        onClick={(e) => {
                          e.stopPropagation();
                          onClose?.();
                        }}
                      >
                        <b>{uname}</b>
                      </Link>
                      {c.createdAt && (
                        <span
                          className={styles.commentMeta}
                          title={new Date(c.createdAt).toLocaleString()}
                        >
                          {timeAgo(c.createdAt, now)}
                        </span>
                      )}
                    </div>
                    <span className={styles.commentText}>{c.text}</span>
                  </div>

                  <div className={styles.commentAction}>
                    <button
                      className={`${styles.commentLikeBtn} ${c.isLiked ? styles.liked : ""}`}
                      onClick={(e) => toggleCommentLike(e, c._id)}
                      aria-pressed={c.isLiked}
                      title={c.isLiked ? "Unlike" : "Like"}
                    >
                      <img
                        src={c.isLiked ? commentLikeFilled : commentLike}
                        alt="like comment"
                        className={styles.commentLikeIcon}
                      />
                    </button>
                    
                  </div>
                </div>
              );
            })}
          </div>

          <div
            className={styles.date}
            title={p.createdAt ? new Date(p.createdAt).toLocaleString() : ""}
          >
            {p.createdAt ? timeAgo(p.createdAt, now) : ""}
          </div>

          <div className={styles.footer}>
            <div className={styles.actions}>
              <img
                src={liked ? LikeFilledIcon : heartIcon}
                alt="Like"
                className={`${styles.icon} ${liked ? styles.liked : ""}`}
                onClick={toggleLike}
                role="button"
                aria-pressed={liked}
              />
              <img
                src={commentIcon}
                alt="Comment"
                className={styles.icon}
                onClick={focusCommentInput}
                role="button"
              />
            </div>
            <div className={styles.likes}>{likes} likes</div>
          </div>

          <form className={styles.commentForm} onSubmit={submitComment}>
            <img
              src={emojiIcon}
              alt="emoji"
              className={styles.emojiIcon}
              onClick={() => setShowEmojiPicker((prev) => !prev)}
            />
            {showEmojiPicker && (
              <div className={styles.emojiPicker}>
                <Picker data={data} onEmojiSelect={(e) => setComment((prev) => prev + e.native)} />
              </div>
            )}
            <input
              ref={inputRef}
              type="text"
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) submitComment(e);
              }}
            />
            <button type="submit" disabled={!comment.trim() || sending}>
              {sending ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      </div>

      {showActions && (
        <PostActionsModal
          onClose={() => setShowActions(false)}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onGoToPost={handleGoToPost}
          onCopyLink={handleCopyLink}
        />
      )}
    </div>
  );
}
