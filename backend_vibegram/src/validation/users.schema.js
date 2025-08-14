import * as Yup from "yup";

export const userUpdateSchema = Yup.object().shape({
  username: Yup.string().min(3).max(20),
  bio: Yup.string().max(300),
  avatar: Yup.string().url(),
});

