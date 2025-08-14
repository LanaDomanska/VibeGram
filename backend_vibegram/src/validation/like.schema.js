export const LikeSchema = Yup.object().shape({
  postId: Yup.string().required('ID поста обязателен'),
});

// export type LikeFormData = Yup.InferType<typeof LikeSchema>;

// export const likeResolver: Resolver<LikeFormData> = async (values, context, options) => {
//   const schema = LikeSchema;
//   return schema.validate(values, { abortEarly: false });
// };