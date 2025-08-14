import React, { useContext, useMemo } from "react";
import {
  Avatar,
  Box,
  Button,
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../contexts/AuthContext";

const Welcome = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const missing = useMemo(
    () => ({
      avatar: !user?.avatar,
      bio: !user?.bio,
      website: !user?.website,
    }),
    [user]
  );

  const isComplete = useMemo(
    () => Object.values(missing).every((v) => !v),
    [missing]
  );

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Box sx={{ textAlign: "center" }}>
        <Avatar
          src={user?.avatar ? `http://localhost:3000${user.avatar}` : "/default-avatar.jpg"}
          sx={{ width: 96, height: 96, mx: "auto", mb: 2 }}
        />
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Привет, {user?.username || "друг"}! 👋
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Добро пожаловать в VibeGram. Давай настроим профиль, чтобы друзья легко тебя находили.
        </Typography>

        <List>
          {[
            { key: "avatar", label: "Загрузить аватар" },
            { key: "bio", label: "Добавить «About»" },
            { key: "website", label: "Указать сайт (необязательно)" },
          ].map((item) => (
            <ListItem key={item.key} disableGutters>
              <ListItemIcon sx={{ minWidth: 36 }}>
                {missing[item.key] ? (
                  <RadioButtonUncheckedIcon />
                ) : (
                  <CheckCircleOutlineIcon />
                )}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </List>

        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
          {!isComplete && (
            <Button
              variant="contained"
              onClick={() =>
                navigate(
                  "/account/edit" // ← замени на твой реальный путь к странице EditProfile
                )
              }
            >
              Заполнить профиль
            </Button>
          )}
          <Button variant="text" onClick={() => navigate("/")}>
            {isComplete ? "На главную" : "Позже"}
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default Welcome;
