import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PostModal from "./PostModal";        // путь тот же, что на Home-странице
import api from "../../api/axios";          // твой axios-инстанс

export default function RoutedPostModal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const { data } = await api.get(`/posts/${id}`); // => /api/posts/:id
        if (ignore) return;
        // под разные ответы бэка
        setPost(data.post || data.item || data);
      } catch (e) {
        setErr(e.response?.data?.message || "Не удалось загрузить пост");
      }
    })();
    return () => { ignore = true; };
  }, [id]);

  if (err) return null;     // можно показать тост/алерт, если хочешь
  if (!post) return null;   // можно Loader, если хочешь

  return (
    <PostModal
      post={post}
      onClose={() => navigate(-1)}
      onDeleted={() => navigate(-1)}
    />
  );
}
