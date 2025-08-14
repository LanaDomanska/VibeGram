import * as messagesService from "../services/messages.service.js";
import {validateBody} from "../middlewares/validateBody.js";
import  messageSchema  from "../validation/messages.schema.js";

export const sendMessage = async (req, res) => {
  await validateBody(messageSchema, req.body);
  const message = await messagesService.sendMessage(req.user.id, req.body.receiverId, req.body.text);
  res.status(201).json(message);
};
export const deleteMessage = async (req, res) => {
  const userId = req.user.id;
  const messageId = req.params.id;

  const deleted = await messagesService.deleteMessage(messageId, userId);

  res.json({ message: "Сообщение удалено", deleted });
};
export const getMessagesBetweenUsers = async (req, res) => {
  const messages = await messagesService.getMessagesBetweenUsers(req.user.id, req.params.userId);
  res.json(messages);
};
export const getInbox = async (req, res) => {
  const inbox = await messagesService.getInbox(req.user.id);
  res.json(inbox);
};