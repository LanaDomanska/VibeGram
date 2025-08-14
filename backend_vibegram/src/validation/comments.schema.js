import * as Yup from "yup";

export const commentCreateSchema = Yup.object({
  text: Yup.string().trim().max(2200).required("Введите текст комментария"),
});
