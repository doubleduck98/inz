import { createFormContext } from '@mantine/form';
import {
  validateEmail,
  validateField,
  validatePhone,
  validateZipCode,
} from '../utils/ValidationUtils';

export interface EditFormValues {
  id: number;
  name: string;
  surname: string;
  dob: string | null;
  street: string;
  house: string;
  apartment: string | null;
  city: string;
  zipCode: string;
  province: string;
  email: string | null;
  phone: string | null;
}

export const [EditFormProvider, useEditFormContext, useEditForm] =
  createFormContext<EditFormValues>();

export const ValidateEditForm = (values: EditFormValues) => {
  const errors: Record<string, string | null> = {};

  validateField(errors, 'name', values.name.trim(), 'Proszę podać imię');
  validateField(
    errors,
    'surname',
    values.surname.trim(),
    'Proszę podać nazwisko'
  );
  errors['dob'] = values.dob ? null : 'Proszę wybrać datę urodzenia';
  validateField(errors, 'street', values.street.trim(), 'Proszę podać ulicę');
  validateField(
    errors,
    'house',
    values.house.trim(),
    'Proszę podać numer domu'
  );
  validateZipCode(errors, values.zipCode.trim());
  validateField(
    errors,
    'city',
    values.city.trim(),
    'Proszę podać miasto zamieszkania'
  );
  errors['province'] = values.province ? null : 'Proszę wybrać województwo';
  errors['email'] = values.email?.trim()
    ? validateEmail(values.email.trim())
    : null;
  errors['phone'] = values.phone?.trim()
    ? validatePhone(values.phone.trim())
    : null;
  return errors;
};
