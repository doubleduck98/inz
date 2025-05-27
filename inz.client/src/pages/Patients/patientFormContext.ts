import { createFormContext } from '@mantine/form';

interface Contact {
  contactName: string;
  email: string | null;
  phone: string | null;
  key: string | null;
}

export interface PatientFormValues {
  name: string;
  surname: string;
  dob: Date | null;
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

export const [PatientFormProvider, usePatientFormContext, usePatientForm] =
  createFormContext<PatientFormValues>();

export const ValidatePatientForm = (
  active: number,
  values: PatientFormValues
) => {
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

const validateContact = (
  errors: Record<string, string | null>,
  field: string,
  contact: { name?: string; email: string | null; phone: string | null }
) => {
  if (field === 'contacts' && !contact.name)
    errors[`${field}.name`] = 'Proszę podać nazwę kontaktu';

  if (!contact.email && !contact.phone) {
    const error = 'Proszę podać chociaż jedną formę kontaktu';
    errors[`${field}.email`] = error;
    errors[`${field}.phone`] = error;
  } else {
    if (contact.email) errors[`${field}.email`] = validateEmail(contact.email);
    if (contact.phone) errors[`${field}.phone`] = validatePhone(contact.phone);
  }
};

const validateField = (
  errors: Record<string, string | null>,
  field: string,
  value: string,
  errorMessage: string
) => {
  if (!value) errors[field] = errorMessage;
  else if (value.length > 64) errors[field] = `Maksymalnaa ilość znaków to 64`;
  else errors[field] = null;
};

const validateZipCode = (
  errors: Record<string, string | null>,
  zipCode: string
) => {
  errors['zipCode'] = /^\d{2}-\d{3}$/.test(zipCode)
    ? null
    : 'Proszę podaać poprawny kod pocztowy';
};

const validateEmail = (email: string) => {
  if (email.length > 64) return 'Maksymalna liczba znaków to 64';
  if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(email))
    return 'Proszę podać popraawny adres email';
  return null;
};

const validatePhone = (phone: string) =>
  /^\+?[\d\- ]{7,20}$/.test(phone)
    ? null
    : 'Proszę podać poprawny numer telefonu';
