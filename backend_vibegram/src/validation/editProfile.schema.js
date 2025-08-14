export const EditProfileSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Минимум 3 символа')
    .max(20, 'Максимум 20 символов'),
  fullName: Yup.string()
    .max(50, 'Максимум 50 символов'),
  bio: Yup.string()
    .max(150, 'Биография не должна превышать 150 символов'),
  website: Yup.string()
    .url('Введите корректный URL')
    .nullable(),
  email: Yup.string()
    .email('Неверный формат email'),
  phone: Yup.string()
    .matches(/^\+?[1-9]\d{7,14}$/, 'Неверный формат номера телефона')
    .nullable(),
});

// export type EditProfileFormData = Yup.InferType<typeof EditProfileSchema>;

// export const editProfileResolver: Resolver<EditProfileFormData> = async (
//   values,
//   context,
//   options
// ) => {
//   const schema = EditProfileSchema;
//   return schema.validate(values, { abortEarly: false });
// };