import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PostModal from "./PostModal";        
import api from "../../api/axios";          

export default function RoutedPostModal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const { data } = await api.get(`/posts/${id}`); 
        if (ignore) return;
        setPost(data.post || data.item || data);
      } catch (e) {
        setErr(e.response?.data?.message || "Не удалось загрузить пост");
      }
    })();
    return () => { ignore = true; };
  }, [id]);

  if (err) return null;     
  if (!post) return null;   

  return (
    <PostModal
      post={post}
      onClose={() => navigate(-1)}
      onDeleted={() => navigate(-1)}
    />
  );
}
