import CryptoJS from 'crypto-js';
import bcrypt from 'bcryptjs';

const SECRET_KEY = process.env.ENCRYPTION_KEY || 'default_secret_key_erp3d_2024';

export const encryptData = (text: string): string => {
  if (!text) return text;
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

export const decryptData = (ciphertext: string): string => {
  if (!ciphertext) return ciphertext;
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Error decrypting data');
    return '';
  }
};

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};
