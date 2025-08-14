import React, { useState } from "react";
import ReactDOM from "react-dom";
import styles from "./CreatePostModal.module.css";
import { TextField, Avatar, Typography, Button } from "@mui/material";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import emoji from "../../assets/icons/emoji.svg";

const CreatePostModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const navigate = useNavigate();

  const [caption, setCaption] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  if (!isOpen || !user) return null;

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || !imageFile) return;
    setError("");
    setLoading(true);
    if (caption.length > 200) {
      setError("Подпись не должна превышать 200 символов.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const imageRes = await api.post("/posts/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const imageUrl = imageRes.data.imageUrl;
      await api.post("/posts", { caption, imageUrl });

      setCaption("");
      setImageFile(null);
      onClose();
      navigate("/");
    } catch (err) {
      console.error("Ошибка при создании поста:", err);
      setError(err.response?.data?.message || "Ошибка при публикации");
    } finally {
      setLoading(false);
    }
  };
  const handleEmojiSelect = (emoji) => {
    setCaption((prev) => prev + emoji.native);
  };

  return ReactDOM.createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <Typography variant="subtitle2">Create new post</Typography>
<Button
  onClick={handleSubmit}
  disabled={!imageFile || loading}
  variant="text"
  sx={{
    color: !imageFile ? "#0095F6" : "#0095F6", 
    fontWeight: 600,
    textTransform: "none",
    fontSize: "14px"
  }}
>
  Share
</Button>

        </div>

        <div className={styles.content}>
          <div className={styles.left}>
            {!imageFile ? (
              <label className={styles.uploadArea}>
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <div className={styles.uploadIcon}></div>
                <Typography>Click to upload</Typography>
              </label>
            ) : (
              <img
                src={URL.createObjectURL(imageFile)}
                alt="preview"
                className={styles.imagePreview}
              />
            )}
          </div>

          <div className={styles.right}>
            <div className={styles.userInfo}>
              <Avatar
                src={
                  user?.avatar
                    ? `http://localhost:3000${user.avatar}`
                    : "/default-avatar.jpg"
                }
                alt={user.username}
                sx={{ width: 32, height: 32 }}
              />

              <Typography fontWeight={600} fontSize={14}>
                {user.username}
              </Typography>
            </div>

            <TextField
              multiline
              placeholder="Write a caption..."
              variant="standard"
              rows={6}
              fullWidth
              value={caption}
              onChange={(e) => {
                if (e.target.value.length <= 200) {
                  setCaption(e.target.value);
                }
              }}
            />

            <div className={styles.actions}>
              <div className={styles.actions}>
                <div className={styles.emojiWrapper}>
                  <img
                    src={emoji}
                    alt="emoji"
                    className={styles.emojiIcon}
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                  />
                  {showEmojiPicker && (
                    <div className={styles.emojiPicker}>
                      <Picker data={data} onEmojiSelect={handleEmojiSelect} />
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.charCounter}>{caption.length}/200</div>
            </div>

            {error && (
              <Typography color="error" fontSize={12}>
                {error}
              </Typography>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default CreatePostModal;
