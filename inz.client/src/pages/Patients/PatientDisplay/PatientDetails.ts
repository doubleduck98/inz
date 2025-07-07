export interface PatientDetails {
  name: string;
  surname: string;
  dob: string;
  street: string;
  house: string;
  apartment: string | null;
  city: string;
  zipCode: string;
  province: string;
  email: string | null;
  phone: string | null;
  contacts: {
    name: string;
    email: string | null;
    phone: string | null;
  }[];
  docs: string[] | null;
}
