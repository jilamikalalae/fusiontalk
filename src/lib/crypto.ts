import crypto from 'crypto';

let algorithm = 'aes256';
const secret = process.env.CRYPTO_SECRET as string;
const key = Buffer.from(secret, 'base64') as any;

export function EncryptString(text: string): {
  encrypted: string;
  iv: string;
} {
  let iv = crypto.randomBytes(8).toString('hex');
  let cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');

  return {
    encrypted: encrypted,
    iv: iv
  };
}

export function DecryptString(encryptedString: string, iv: string): string {
  let decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted =
    decipher.update(encryptedString, 'hex', 'utf8') + decipher.final('utf8');
  return decrypted;
}
