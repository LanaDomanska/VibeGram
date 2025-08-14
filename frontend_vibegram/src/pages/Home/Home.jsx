import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import PostCard from "../../components/PostCard/PostCard";
import styles from "./Home.module.css";
import { useAuth } from "../../hooks/useAuth";
import PostModal from "../../components/modals/PostModal";
import CreatePostModal from "../../components/modals/CreatePostModal"; 
import AddIcon from "@mui/icons-material/Add";
import { Button, Typography } from "@mui/material";

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); 

  const fetchPosts = useCallback(async () => {
    try {
      const res = await api.get("/posts/feed");
      setPosts(res.data.posts);
    } catch (err) {
      console.error("Ошибка при загрузке постов:", err);
      setError(err.response?.data?.message || "Не удалось загрузить посты");
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated === false) {
      navigate("/login");
      return;
    }
    if (isAuthenticated === true) {
      fetchPosts();
    }
  }, [isAuthenticated, navigate, fetchPosts]);

  if (isAuthenticated === null) return null;

  return (
    <div className={styles.feed}>
      {error && <p className={styles.error}>{error}</p>}

      {posts.length === 0 && !error && (
        <div className={styles.emptyContainer}>
          <div className={styles.emptyContent}>
            <Typography variant="h6" style={{ margin: "16px 0" }}>
               No posts to display
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => setIsCreateModalOpen(true)}
            >
               Add Post
            </Button>
          </div>
        </div>
      )}

      <div className={styles.postsGrid}>
        {posts.map((post) => (
          <div
            key={post._id}
            className={styles.postWrap}
            onClick={() => setSelectedPost(post)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" ? setSelectedPost(post) : null)}
          >
            <PostCard post={post} />
          </div>
        ))}
      </div>

      {selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onDeleted={() => {
            setSelectedPost(null);
            fetchPosts();
          }}
        />
      )}

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPostCreated={fetchPosts}
      />
    </div>
  );
}