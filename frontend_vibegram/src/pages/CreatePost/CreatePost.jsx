import React, { useState } from "react";
import api from "../../services/api/api";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Box, Typography } from "@mui/material";

const CreatePost = () => {
  const navigate = useNavigate();
  const [caption, setCaption] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!imageFile) {
      setError("Пожалуйста, выберите изображение.");
      return;
    }

    try {
      // 1. Загрузить изображение
      const formData = new FormData();
      formData.append("image", imageFile);

      const imageRes = await api.post("/posts/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const imageUrl = imageRes.data.imageUrl;

      // 2. Создать пост
      await api.post("/posts", {
        caption,
        imageUrl,
      });

      navigate("/"); // вернуться в ленту
    } catch (err) {
      console.error("Ошибка при создании поста:", err);
      console.log("Ответ от сервера:", err.response?.data); 
      setError(err.response?.data?.message || "Ошибка при публикации");
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: 500,
        margin: "0 auto",
        padding: 3,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Typography variant="h5">Создать пост</Typography>

      <TextField
        label="Описание"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        multiline
        rows={4}
      />

      <Button variant="contained" component="label">
        Загрузить изображение
        <input type="file" hidden accept="image/*" onChange={handleImageChange} />
      </Button>

      {imageFile && (
        <Typography variant="body2" color="text.secondary">
          Выбрано: {imageFile.name}
        </Typography>
      )}

      {error && (
        <Typography color="error">{error}</Typography>
      )}

      <Button type="submit" variant="contained" color="primary">
        Опубликовать
      </Button>
    </Box>
  );
};

export default CreatePost;
