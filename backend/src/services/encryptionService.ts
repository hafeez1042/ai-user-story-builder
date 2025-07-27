import * as crypto from 'crypto';

/**
 * Service for handling encryption and decryption of sensitive data
 */
export class EncryptionService {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32; // 256 bits
  private static readonly IV_LENGTH = 16; // 16 bytes
  private static readonly SALT_LENGTH = 16; // 16 bytes
  private static readonly ITERATIONS = 100000;
  private static readonly DIGEST = 'sha512';
  
  /**
   * Encrypts data with a password
   * 
   * @param data Data to encrypt
   * @param password User password to use for encryption
   * @param salt Optional salt, will be generated if not provided
   * @returns Object containing encrypted data and salt
   */
  static encrypt(data: string, password: string, salt?: string): { 
    encryptedData: string, 
    salt: string 
  } {
    // Generate or use provided salt
    const saltBuffer = salt 
      ? Buffer.from(salt, 'hex') 
      : crypto.randomBytes(this.SALT_LENGTH);
    
    // Derive key from password
    const key = crypto.pbkdf2Sync(
      password, 
      saltBuffer, 
      this.ITERATIONS, 
      this.KEY_LENGTH, 
      this.DIGEST
    );
    
    // Generate initialization vector
    const iv = crypto.randomBytes(this.IV_LENGTH);
    
    // Create cipher
    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
    
    // Encrypt data
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get auth tag for GCM
    const authTag = cipher.getAuthTag().toString('hex');
    
    // Format: iv:encrypted:authTag
    const encryptedData = `${iv.toString('hex')}:${encrypted}:${authTag}`;
    
    return {
      encryptedData,
      salt: saltBuffer.toString('hex')
    };
  }
  
  /**
   * Decrypts data with a password
   * 
   * @param encryptedData Encrypted data string
   * @param password User password
   * @param salt Salt used during encryption
   * @returns Decrypted data or null if decryption fails
   */
  static decrypt(encryptedData: string, password: string, salt: string): string | null {
    try {
      // Parse encrypted data (format: iv:encrypted:authTag)
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        return null;
      }
      
      const [ivHex, encryptedHex, authTagHex] = parts;
      
      // Convert hex to buffers
      const iv = Buffer.from(ivHex, 'hex');
      const encrypted = Buffer.from(encryptedHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const saltBuffer = Buffer.from(salt, 'hex');
      
      // Derive key from password
      const key = crypto.pbkdf2Sync(
        password, 
        saltBuffer, 
        this.ITERATIONS, 
        this.KEY_LENGTH, 
        this.DIGEST
      );
      
      // Create decipher
      const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
      decipher.setAuthTag(authTag);
      
      // Decrypt data
      let decrypted = decipher.update(encrypted).toString('utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }
  
  /**
   * Validates if a password can decrypt the given data
   * 
   * @param encryptedData Encrypted data string
   * @param password Password to validate
   * @param salt Salt used during encryption
   * @returns True if password is valid
   */
  static validatePassword(encryptedData: string, password: string, salt: string): boolean {
    return this.decrypt(encryptedData, password, salt) !== null;
  }
}
