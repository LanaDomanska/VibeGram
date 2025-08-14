import { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PostModal from "@/components/modals/PostModal.jsx"; 
import s from "./Explore.module.css";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN ?? "http://localhost:3000";

function resolveImg(raw = "") {
  if (!raw) return "";
  if (raw.startsWith("http")) return raw;
  if (raw.startsWith("/public/")) return API_ORIGIN + raw.replace("/public", "");
  if (raw.startsWith("/posts/"))  return API_ORIGIN + raw;
  return `${API_ORIGIN}/posts/${raw}`;
}

export default function Explore() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  const qs = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const postId = qs.get("post");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_ORIGIN}/api/explore?limit=60`, {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setItems(data.items || []);
      } catch (e) {
        setError(String(e.message || e));
        setItems([]);
      }
    })();
  }, []);

  const openPost = useCallback((id) => {
    const p = new URLSearchParams(location.search);
    p.set("post", id);
    navigate({ pathname: location.pathname, search: p.toString() }, { replace: false });
  }, [location.pathname, location.search, navigate]);

  const closePost = useCallback(() => {
    const p = new URLSearchParams(location.search);
    p.delete("post");
    navigate({ pathname: location.pathname, search: p.toString() }, { replace: true });
  }, [location.pathname, location.search, navigate]);

  if (items === null) return <div className={s.state}>Загружаю…</div>;
  if (error) return <div className={s.state}>Ошибка: {error}</div>;
  if (items.length === 0) return <div className={s.state}>Пока нет постов для показа</div>;

  return (
    <>
      <div className={s.grid}>
        {items.map((p) => {
          const src = resolveImg(p.image || p.imageUrl);
          return (
            <button
              key={p._id}
              className={s.card}
              onClick={() => navigate(`/p/${p._id}`)}

              aria-label="Открыть пост"
            >
              <img src={src} alt={p.caption || "post"} loading="lazy" />
            </button>
          );
        })}
      </div>

      {postId && (
        <PostModal
          postId={postId}
          id={postId}                 
          open={true}
          isOpen={true}
          onClose={closePost}
          onRequestClose={closePost}  
        />
      )}
    </>
  );
}
