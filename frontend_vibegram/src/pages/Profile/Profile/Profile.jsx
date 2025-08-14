import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./Profile.module.css";
import { useAuth } from "../../../hooks/useAuth";
import api from "../../../api/axios";
import Loader from "../../../components/common/Loader/Loader";
import linkIcon from "../../../assets/icons/link.svg";
import PostModal from "../../../components/modals/PostModal";
import AddIcon from "@mui/icons-material/Add";
import { Button, Typography } from "@mui/material";
import CreatePostModal from "../../../components/modals/CreatePostModal";
// import defaultAvatar from "@/assets/images/default-avatar.png"; 
const defaultAvatar = "/images/default-avatar.png";

const Profile = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const navigate = useNavigate();
  const isCurrentUser = user?.username === username;
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Загрузка постов
  const fetchPosts = useCallback(async (userId) => {
    try {
      const { data } = await api.get(`/posts/user/${userId}`);
      setPosts(data);
    } catch (err) {
      console.error("❌ Ошибка при загрузке постов:", err);
    }
  }, []);

  // Загрузка профиля и счётчиков подписок
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);

        // 1) Достаём профиль по username
        const { data: userData } = await api.get(`/users/${username}`);
        const merged = isCurrentUser ? { ...userData, avatar: user?.avatar } : userData;

        // 2) Подгружаем списки followers/following, чтобы получить длины
        const [followersRes, followingRes] = await Promise.all([
          api.get(`/follows/${userData._id}/followers`),
          api.get(`/follows/${userData._id}/following`),
        ]);

        setProfile({
          ...merged,
          followersCount: Array.isArray(followersRes.data) ? followersRes.data.length : 0,
          followingCount: Array.isArray(followingRes.data) ? followingRes.data.length : 0,
        });

        // 3) Загружаем посты
        await fetchPosts(userData._id);
      } catch (err) {
        console.error("❌ Ошибка при загрузке профиля или постов:", err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [username, user, user?.avatar, isCurrentUser, fetchPosts]);

  // Проверка, подписан ли я на этот профиль
  useEffect(() => {
    if (!isCurrentUser && profile && user?._id) {
      api
        .get(`/follows/${user._id}/following`)
        .then(({ data }) => setIsFollowing(data.some((u) => u._id === profile._id)))
        .catch((err) => console.error("❌ Ошибка при проверке статуса подписки:", err));
    }
  }, [profile, user, isCurrentUser]);

  // Обработчик подписки / отписки
  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await api.delete(`/follows/${profile._id}/unfollow`);
        setIsFollowing(false);
        setProfile((prev) => ({ ...prev, followersCount: prev.followersCount - 1 }));
      } else {
        await api.post(`/follows/${profile._id}/follow`);
        setIsFollowing(true);
        setProfile((prev) => ({ ...prev, followersCount: prev.followersCount + 1 }));
      }
    } catch (err) {
      console.error("❌ Ошибка при подписке/отписке:", err);
    }
  };

  if (loading) return <Loader />;
  if (!profile) return <p>Профиль не найден</p>;
const getAvatarUrl = (avatar) => {
  if (!avatar) return defaultAvatar;
  return avatar.startsWith('http') ? avatar : `http://localhost:3000${avatar}`;
};
  return (
    <div className={styles.profile}>
      {/* Header */}
      <div className={styles.header}>
<img
  src={getAvatarUrl(user?.avatar)}
  alt="avatar"
  className={styles.avatarIcon}
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = defaultAvatar;
  }}
/>

        <div className={styles.info}>
          <div className={styles.top}>
            <h2 className={styles.usernameTitle}>{profile.username}</h2>

            {isCurrentUser ? (
              <button className={styles.editBtn} onClick={() => navigate(`/edit-profile`)}>
               Edit Profile
              </button>
            ) : (
              <div className={styles.actions}>
                <button className={styles.followBtn} onClick={handleFollowToggle}>
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>

                {/* Кнопка "Отправить сообщение" — ведёт на /messages с параметрами */}
                <button
                  className={styles.messageBtn}
                  onClick={() =>
                    navigate(
                      `/messages?to=${profile._id}` +
                        `&uname=${encodeURIComponent(profile.username)}` +
                        `&avatar=${encodeURIComponent(profile.avatar || "")}`
                    )
                  }
                >
                  Send Message
                </button>
              </div>
            )}
          </div>

          <ul className={styles.stats}>
            <li><strong>{posts.length}</strong> posts</li>
            <li><strong>{profile.followersCount}</strong> followers</li>
            <li><strong>{profile.followingCount}</strong> following</li>
          </ul>

          <div className={styles.bio}>
            {profile.name && <strong>{profile.name}</strong>}
            {profile.bio && <p>{profile.bio}</p>}
            {profile.website && (
              <div className={styles.website}>
                <img src={linkIcon} alt="link icon" />
                <a
                  href={
                    profile.website.startsWith("http://") || profile.website.startsWith("https://")
                      ? profile.website
                      : `https://${profile.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {profile.website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Посты */}
<div className={styles.postsGrid}>
  {posts.length > 0 ? (
    posts.map((p) => (
      <img
        key={p._id}
        src={`http://localhost:3000${
          p.imageUrl.startsWith("/public") ? p.imageUrl.replace("/public", "") : p.imageUrl
        }`}
        alt="post"
        className={styles.postImage}
        onClick={() => setSelectedPost(p)}
      />
    ))
  ) : (
    <div className={styles.emptyContainer}>
      <div className={styles.emptyContent}>
        <Typography variant="h6" style={{ margin: "16px 0" }}>
          {isCurrentUser ? "No posts to display" : "No posts"}
        </Typography>
        {isCurrentUser && (
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setIsCreateModalOpen(true)}
          >
             Add Post
          </Button>
        )}
      </div>
    </div>
  )}
</div>

      {/* Модалка */}
      {selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onDeleted={() => {
            setSelectedPost(null);
            fetchPosts(profile._id);
          }}
        />
        
      )}
      {isCurrentUser && (
  <CreatePostModal
    isOpen={isCreateModalOpen}
    onClose={() => setIsCreateModalOpen(false)}
    onPostCreated={() => fetchPosts(profile._id)}
  />
)}
    </div>
    
  );
};

export default Profile;
