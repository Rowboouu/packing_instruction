import { useState } from 'react';

export function useGeneratePassword(length: number) {
  const charset =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  const genNewPassword = (): string => {
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      result += charset.charAt(randomIndex);
    }
    return result;
  };

  const initialString = genNewPassword();

  const [password, setPassword] = useState<string>(initialString);

  const generatePassword = () => {
    const newRandomString = genNewPassword();
    setPassword(newRandomString);
    return newRandomString;
  };

  return { password, generatePassword };
}
