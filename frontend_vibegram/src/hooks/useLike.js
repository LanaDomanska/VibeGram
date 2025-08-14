import { useCallback, useEffect, useState } from "react";
import api from "@/api/axios";

/** Единый лайк-хук для карточки и модалки */
export default function useLike({ postId, initialLiked = false, initialLikes = 0, onChange }) {
  const [liked, setLiked] = useState(!!initialLiked);
  const [likes, setLikes] = useState(initialLikes ?? 0);
  const [loading, setLoading] = useState(false);

  // если в компонент прилетели новые значения (после догрузки поста) — синхронизируемся
  useEffect(() => setLiked(!!initialLiked), [initialLiked]);
  useEffect(() => setLikes(initialLikes ?? 0), [initialLikes]);

  const toggleLike = useCallback(async (e) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();
    if (!postId || loading) return;

    const next = !liked;
    setLoading(true);
    // оптимистично
    setLiked(next);
    setLikes(c => c + (next ? 1 : -1));

    const apply = (data) => {
      if (typeof data?.likes === "number") setLikes(data.likes);
      if (typeof data?.isLiked === "boolean") setLiked(data.isLiked);
      onChange?.({ likes: data?.likes, isLiked: data?.isLiked });
    };

    try {
      const fn = next ? api.post : api.delete;
      const { data } = await fn(`/posts/${postId}/like`);
      apply(data);
    } catch {
      // fallback на /likes/:postId, если в проекте используется этот роут
      try {
        const fn = next ? api.post : api.delete;
        const { data } = await fn(`/likes/${postId}`);
        apply(data);
      } catch (err2) {
        // откат
        setLiked(!next);
        setLikes(c => c + (next ? -1 : 1));
        console.error("like error:", err2?.response?.data || err2?.message);
      }
    } finally {
      setLoading(false);
    }
  }, [postId, liked, loading, onChange]);

  return { liked, likes, toggleLike, loading, setLiked, setLikes };
}
