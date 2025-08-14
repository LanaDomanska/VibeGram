import React, { useState, useContext, useEffect } from "react";
import {
  Avatar,
  Box,
  Button,
  TextField,
  Typography,
} from "@mui/material";
import { AuthContext } from "../../../contexts/AuthContext";
import api from "../../../api/axios";
import styles from "./EditProfile.module.css";
import Loader from "../../../components/common/Loader/Loader";
import { useNavigate } from "react-router-dom";


const MAX_ABOUT_LENGTH = 150;
const defaultAvatar = "/images/default-avatar.png";
const EditProfile = () => {
  const { user, updateUser } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [website, setWebsite] = useState("");
  const [about, setAbout] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(defaultAvatar);
  const [message, setMessage] = useState("");
  const [welcomeText, setWelcomeText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const firstLogin = localStorage.getItem("firstLogin") === "true";
    if (firstLogin) {
      setWelcomeText(
        "Welcome to VibeGram! Please complete your profile."
      );
      localStorage.removeItem("firstLogin"); 
    }
  }, []);

useEffect(() => {
  if (user) {
    setUsername(user.username || "");
    setWebsite(user.website || "");
    setAbout(user.bio || "");
    setPreview(
      user.avatar && user.avatar.trim() !== "" 
        ? `http://localhost:3000${user.avatar}`
        : defaultAvatar 
    );
  }
}, [user]);

  if (!user) return <Loader />;

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);

        const avatarRes = await api.post("/users/avatar", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        updateUser((prev) => ({
          ...prev,
          avatar: avatarRes.data.avatarUrl,
        }));
      }

      const formattedWebsite = website.trim()
        ? website.startsWith("http://") || website.startsWith("https://")
          ? website
          : `https://${website}`
        : "";

      const res = await api.put("/users", {
        username,
        website: formattedWebsite,
        bio: about,
      });

      updateUser((prev) => ({
        ...prev,
        username: res.data.username,
        website: res.data.website,
        bio: res.data.bio,
      }));

      setMessage("Изменения сохранены ✔");

      setTimeout(() => {
        navigate(`/profile/${username}`);
      }, 800);
    } catch (err) {
      console.error(err);

    }
  };

  return (
    <Box className={styles.container}>
      {welcomeText && (
        <Box
          sx={{
            mb: 2,
            p: 2,
            borderRadius: 2,
            backgroundColor: "#0095F6",
            color:"#fff",
          }}
        >
          <Typography variant="body1">{welcomeText}</Typography>
        </Box>
      )}

      <Typography variant="h6" className={styles.title}>
        Edit profile
      </Typography>

      <Box className={styles.profileBox}>
        <Avatar 
  src={preview} 
  sx={{ width: 64, height: 64 }}
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = defaultAvatar;
  }}
/>

        <label className={styles.newPhotoLabel}>
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleAvatarChange}
          />
          <Button
            variant="outlined"
            size="small"
            className={styles.newPhotoBtn}
            component="span"
          >
            New photo
          </Button>
        </label>
      </Box>

      <Box className={styles.userText}>
        <Typography fontWeight={600}>{username}</Typography>
        <Typography color="text.secondary">{about}</Typography>
      </Box>

      <TextField
        label="Username"
        fullWidth
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <TextField
        label="Website"
        fullWidth
        margin="normal"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
      />
      <TextField
        label="About"
        fullWidth
        margin="normal"
        multiline
        rows={4}
        value={about}
        onChange={(e) => {
          if (e.target.value.length <= MAX_ABOUT_LENGTH) {
            setAbout(e.target.value);
          }
        }}
        helperText={`${about.length} / ${MAX_ABOUT_LENGTH}`}
      />

      {message && (
        <Typography mt={1} color="secondary">
          {message}
        </Typography>
      )}

      <Button
        variant="contained"
        fullWidth
        className={styles.saveButton}
        onClick={handleSave}
      >
        Save
      </Button>
    </Box>
  );
};

export default EditProfile;
