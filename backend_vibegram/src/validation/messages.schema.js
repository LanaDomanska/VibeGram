import * as Yup from "yup";

const messageSchema = Yup.object({
  text: Yup.string().trim().max(2200).required("Введите текст сообщения"),
});

export default messageSchema;
