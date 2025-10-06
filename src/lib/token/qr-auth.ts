import { v4 as uuidv4 } from 'uuid';

// QR token data structure
export interface QrTokenData {
  token: string;
  expiresAt: string | null; // ISO date string or null for never expires
  createdAt: string;
}

// Type for QR expiration options
export type ExpirationOption = '30min' | '1hour' | 'never';

// Device connection data
export interface DeviceConnection {
  deviceId: string;
  connectedAt: string;
  expiresAt: string | null;
}

/**
 * Generate a QR token for authentication
 * @param expirationOption - When the token should expire
 * @returns QR token data
 */
export function generateQrToken(expirationOption: ExpirationOption): QrTokenData {
  const now = new Date();
  const token = uuidv4();
  let expiresAt: Date | null = null;
  
  switch (expirationOption) {
    case '30min':
      expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes
      break;
    case '1hour':
      expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour
      break;
    case 'never':
      expiresAt = null;
      break;
  }
  
  return {
    token,
    expiresAt: expiresAt ? expiresAt.toISOString() : null,
    createdAt: now.toISOString()
  };
}

/**
 * Store QR token in localStorage
 * @param qrData - QR token data
 */
export function storeQrToken(qrData: QrTokenData): void {
  try {
    localStorage.setItem('samga-qr-token', JSON.stringify(qrData));
  } catch (error) {
    console.error('Failed to store QR token:', error);
  }
}

/**
 * Retrieve stored QR token from localStorage
 * @returns QR token data or null if not found
 */
export function getStoredQrToken(): QrTokenData | null {
  try {
    const storedToken = localStorage.getItem('samga-qr-token');
    return storedToken ? JSON.parse(storedToken) : null;
  } catch (error) {
    console.error('Failed to retrieve QR token:', error);
    return null;
  }
}

/**
 * Check if a QR token has expired
 * @param token - QR token data
 * @returns boolean indicating if token is expired
 */
export function isTokenExpired(token: QrTokenData): boolean {
  if (!token.expiresAt) return false; // Never expires
  
  const expirationDate = new Date(token.expiresAt);
  return new Date() > expirationDate;
}

/**
 * Store connected device information
 * @param deviceConnection - Device connection data
 */
export function storeConnectedDevice(deviceConnection: DeviceConnection): void {
  try {
    // Get existing connected devices
    const storedDevices = localStorage.getItem('samga-authorized-devices');
    const devices: DeviceConnection[] = storedDevices ? JSON.parse(storedDevices) : [];
    
    // Add new device
    devices.push(deviceConnection);
    
    // Store updated list
    localStorage.setItem('samga-authorized-devices', JSON.stringify(devices));
  } catch (error) {
    console.error('Failed to store connected device:', error);
  }
}

/**
 * Get list of connected devices
 * @returns Array of connected devices
 */
export function getConnectedDevices(): DeviceConnection[] {
  try {
    const storedDevices = localStorage.getItem('samga-authorized-devices');
    return storedDevices ? JSON.parse(storedDevices) : [];
  } catch (error) {
    console.error('Failed to retrieve connected devices:', error);
    return [];
  }
}

/**
 * Remove expired devices from storage
 */
export function cleanupExpiredDevices(): void {
  try {
    const devices = getConnectedDevices();
    const now = new Date();
    
    const validDevices = devices.filter(device => {
      if (!device.expiresAt) return true; // Never expires
      return new Date(device.expiresAt) > now;
    });
    
    localStorage.setItem('samga-authorized-devices', JSON.stringify(validDevices));
  } catch (error) {
    console.error('Failed to cleanup expired devices:', error);
  }
}

/**
 * Verify a token is valid and matches stored token
 * @param token - The token to verify
 * @returns Boolean indicating if token is valid
 */
export function verifyQrToken(token: string): boolean {
  const storedToken = getStoredQrToken();
  
  if (!storedToken) return false;
  if (storedToken.token !== token) return false;
  if (isTokenExpired(storedToken)) return false;
  
  return true;
} 