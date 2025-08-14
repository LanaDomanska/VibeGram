// import * as Yup from "yup";

// const usernameRegex = /^[a-zA-Z0-9_.]{3,30}$/;

// export const registerSchema = Yup.object({
//   fullName: Yup.string().min(2).max(50).required("Full name is required"),
//   username: Yup
//     .string()
//     .matches(usernameRegex, "Username can only contain letters, numbers, _ and .")
//     .required("Username is required"),
//   email: Yup.string().email("Invalid email").required("Email is required"),
//   password: Yup.string().min(6, "Password must be at least 6 characters").required(),
// });

// export const loginSchema = Yup.object({
//   email: Yup.string().email("Invalid email").required("Email is required"),
//   password: Yup.string().required("Password is required"),
// });
