import { createFormContext } from '@mantine/form';
import {
  validateEmail,
  validateField,
  validatePhone,
} from '../utils/ValidationUtils';

export interface AddContactFormValues {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
}

export const [
  AddContactFormProvider,
  useAddContactFormContext,
  useAddContactForm,
] = createFormContext<AddContactFormValues>();

export const ValidateAddConForm = (values: AddContactFormValues) => {
  const errors: Record<string, string | null> = {};
  validateField(
    errors,
    'name',
    values.name.trim(),
    'Proszę podać nazwę kontaktu'
  );
  if (!values.email && !values.phone) {
    const error = 'Proszę podać chociaż jedną formę kontaktu';
    errors['email'] = error;
    errors['phone'] = error;
  } else {
    if (values.email?.trim())
      errors['email'] = validateEmail(values.email.trim());
    if (values.phone?.trim())
      errors['phone'] = validatePhone(values.phone.trim());
  }
  return errors;
};
