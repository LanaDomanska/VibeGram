export const LikeSchema = Yup.object().shape({
  postId: Yup.string().required('ID поста обязателен'),
});

