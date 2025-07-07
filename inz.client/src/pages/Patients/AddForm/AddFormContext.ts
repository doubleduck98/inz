import { createFormContext } from '@mantine/form';
import {
  validateField,
  validateZipCode,
  validateContact,
} from '../utils/ValidationUtils';

interface Contact {
  contactName: string;
  email: string | null;
  phone: string | null;
  key: string | null;
}

export interface AddFormValues {
  name: string;
  surname: string;
  dob: string | null;
  street: string;
  house: string;
  apartment: string | null;
  city: string;
  zipCode: string;
  province: string;
  patientContact: {
    email: string | null;
    phone: string | null;
  };
  hasContacts: boolean;
  contacts: Contact[];
}

export const [AddFormProvider, useAddFormContext, useAddForm] =
  createFormContext<AddFormValues>();

export const ValidatePatientForm = (active: number, values: AddFormValues) => {
  const errors: Record<string, string | null> = {};
  if (active === 0) {
    validateField(errors, 'name', values.name, 'Proszę podać imię');
    validateField(errors, 'surname', values.surname, 'Proszę podać nazwisko');
    errors['dob'] = values.dob ? null : 'Proszę wybrać datę urodzenia';
  }
  if (active === 1) {
    validateField(errors, 'street', values.street, 'Proszę podać ulicę');
    validateField(errors, 'house', values.house, 'Proszę podać numer domu');
    validateZipCode(errors, values.zipCode);
    validateField(
      errors,
      'city',
      values.city,
      'Proszę podać miasto zamieszkania'
    );
    errors['province'] = values.province ? null : 'Proszę wybrać województwo';
  }
  if (active === 2) {
    if (values.hasContacts) {
      values.contacts.forEach((contact, i) => {
        validateContact(errors, `contacts.${i}`, contact);
      });
    } else {
      validateContact(errors, 'patientContact', values.patientContact);
    }
    return errors;
  }

  return errors;
};
