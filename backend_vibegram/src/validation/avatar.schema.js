// validationSchemas/AvatarSchema.js
import * as Yup from 'yup';
import { Resolver } from '@hookform/resolvers/yup';

export const AvatarSchema = Yup.object().shape({
  avatar: Yup.mixed()
    .required('Выберите изображение')
    .test('fileType', 'Неверный тип файла', value => {
      if (!value) return true;
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      return validTypes.includes(value.type);
    }),
});

// export type AvatarFormData = Yup.InferType<typeof AvatarSchema>;

// export const avatarResolver: Resolver<AvatarFormData> = async (values, context, options) => {
//   return AvatarSchema.validate(values, { abortEarly: false });
// };