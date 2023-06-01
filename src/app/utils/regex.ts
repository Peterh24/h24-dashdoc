export const regex = {
  email: '^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$',
  phone: '^(\\+\\d{1,3}\\s?)?0\\s?(\\d{1,2}\\s?){4}\\d{2}$'
}

export const regexErrors = {
  email: 'Merci d\'indiquer un email valide',
  phone: 'Merci d\'indiquer un numéro de téléphone valide'
}
