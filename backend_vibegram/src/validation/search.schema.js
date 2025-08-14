export const SearchSchema = Yup.object().shape({
  query: Yup.string()
    .min(1, 'Введите хотя бы один символ')
    .required('Введите запрос'),
});

