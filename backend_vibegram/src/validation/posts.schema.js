import * as Yup from "yup";

export const postCreateSchema = Yup.object({
  caption: Yup.string().max(2200).required("Описание обязательно"),
 imageUrl: Yup.string()
  // .matches(/^\/?public\/posts\/.+\.(jpg|jpeg|png|gif|webp)$/i, "Неверная ссылка на изображение")
  .required("Изображение обязательно"),

});

export const postUpdateSchema = Yup.object({
  caption: Yup.string().max(2200),
  imageUrl: Yup.string().url("Неверная ссылка на изображение"),
});
