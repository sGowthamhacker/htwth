
export const DEFAULT_TOTP_SECRET = import.meta.env.VITE_DEFAULT_TOTP_SECRET || 'JBSWY3DPEHPK3PXP';

export function generateTOTPSecret(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32ToBuffer(str: string): Uint8Array {
  let buffer = [];
  let bits = 0;
  let value = 0;
  
  const cleanStr = str.toUpperCase().replace(/=+$/, '');
  
  for (let i = 0; i < cleanStr.length; i++) {
    const idx = base32Chars.indexOf(cleanStr[i]);
    if (idx === -1) continue;
    
    value = (value << 5) | idx;
    bits += 5;
    
    if (bits >= 8) {
      buffer.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return new Uint8Array(buffer);
}

export async function verifyTOTP(token: string, secret: string = DEFAULT_TOTP_SECRET): Promise<boolean> {
  // TOTP code must be 6 digits
  if (!token || token.length !== 6 || isNaN(Number(token))) return false;

  try {
    const keyBytes = base32ToBuffer(secret);
    const epoch = Math.floor(Date.now() / 1000);
    const timeStep = 30;
    
    // Check current, previous, and next window to account for drift
    for (let i = -1; i <= 1; i++) {
      const counter = Math.floor(epoch / timeStep) + i;
      
      // Create buffer for counter (8 bytes, big endian)
      const counterBuffer = new ArrayBuffer(8);
      const view = new DataView(counterBuffer);
      
      // JS numbers are doubles (64-bit floats). 
      // Safe integer range is 2^53.
      // We need to write a 64-bit integer.
      // Since counter is epoch/30, it fits in the low 32 bits for many years.
      view.setUint32(4, counter, false); // Low 32 bits
      view.setUint32(0, 0, false);       // High 32 bits
  
      const key = await window.crypto.subtle.importKey(
        'raw',
        keyBytes,
        { name: 'HMAC', hash: 'SHA-1' },
        false,
        ['sign']
      );
  
      const signature = await window.crypto.subtle.sign('HMAC', key, counterBuffer);
      const hmac = new Uint8Array(signature);
      
      const offset = hmac[hmac.length - 1] & 0xf;
      const binary =
        ((hmac[offset] & 0x7f) << 24) |
        ((hmac[offset + 1] & 0xff) << 16) |
        ((hmac[offset + 2] & 0xff) << 8) |
        (hmac[offset + 3] & 0xff);
        
      const generated = (binary % 1000000).toString().padStart(6, '0');
      
      if (generated === token) {
        return true;
      }
    }
  } catch (err) {
      console.error("TOTP Check Failed", err);
      return false;
  }
  
  return false;
}
