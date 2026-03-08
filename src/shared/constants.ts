
import { v4 as uuidv4 } from 'uuid';

export const MinimumIdLength = 11;
export const MaximumIdLength = 36;

export const passwordRegex = new RegExp(
  // '^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$',
  '^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$',
);
export const passwordRegexFailedMessage = `Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.`;

export const isPasswordValid = (password: string) =>
  passwordRegex.test(password);

export const generateUUID = (): string => {
  const id = uuidv4();
  // const cleanId = id.replace(/-/g, '');
  // return cleanId;
  return id;
};

export const formatUserPhoneNumber = (phoneNumber: string): string => {
  const phone = phoneNumber.trim();
  const len = phone.length;
  const phoneTrimmed = phone.substring(len - 9);
  return `0${phoneTrimmed}`;
};

export const makeId = () => {
  let text: string = '';
  const possibleCombinations: string =
    'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for (let i: number = 0; i < 11; i++) {
    if (i === 0) {
      text +=
        possibleCombinations[
          Math.floor(Math.random() * possibleCombinations.length)
        ];
    } else {
      text +=
        possibleCombinations[
          Math.floor(Math.random() * possibleCombinations.length)
        ];
    }
  }

  return text;
};
