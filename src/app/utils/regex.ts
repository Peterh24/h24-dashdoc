import { AbstractControl, ValidatorFn } from "@angular/forms";

export const regex = {
  email: '^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$',
  phone: '^(\\+\\d{1,3}\\s?)?0\\s?(\\d{1,2}\\s?){4}\\d{2}$'
}

export const regexErrors = {
  email: 'Merci d\'indiquer un email valide',
  phone: 'Merci d\'indiquer un numéro de téléphone valide',
  password: 'Au moins une lettre, un chiffre, au moins 8 caractères',
}

export const passwordValidator = (): ValidatorFn => {
  return (control: AbstractControl): {[key: string]: any} => {
    const value = control.value;

    if (!value) {
          return null;
      }

      const valid = value.match (/^[\w.:!$=#&@+-]{8,}$/) && 
        value.match (/[a-zA-Z]/) && 
        value.match (/[0-9]/);

      return valid ? null : { password: true };
  }
}

export const phoneValidator = (): ValidatorFn => {
  return (control: AbstractControl): {[key: string]: any} => {
      const value = control.value;

      if (!value) {
          return null;
      }

      if (value.match (/^0[0-9]{9}$/)) {
        return null;
      }

      if (value.match (/^\+33/) && !value.match (/^\+33[1-9][0-9]{8}$/)) {
        return { phone: true };
      }

      return value.match (/^\+\d+/) ? null : { phone: true };
  }
}