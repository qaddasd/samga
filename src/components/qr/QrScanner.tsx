'use client';

import React, { useEffect, useState } from 'react';
import QrReader from 'react-qr-scanner';
import { Button } from '@/components/ui/button';
import { Spinner, Camera, CameraRotate } from '@phosphor-icons/react';
import { Card, CardContent } from '@/components/ui/card';

interface QrScannerProps {
  onScan: (data: string) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
}

const QrScanner: React.FC<QrScannerProps> = ({ onScan, onError, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFlashlightOn, setIsFlashlightOn] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [key, setKey] = useState(0);

  useEffect(() => {
    // Reset camera error when component mounts
    setCameraError(null);
    
    // Set a timeout to automatically hide the loading spinner after a few seconds
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    
    return () => clearTimeout(timeoutId);
  }, []);

  const handleScan = (data: { text: string } | null) => {
    console.log('QR scan data received:', data);
    if (data && data.text) {
      console.log('Valid QR data found:', data.text);
      setIsLoading(false);
      onScan(data.text);
    } else {
      console.log('No valid QR data in scan result');
    }
  };

  const handleError = (err: Error) => {
    console.error('QR Scanner error:', err);
    setCameraError('Ошибка доступа к камере. Пожалуйста, предоставьте разрешение на использование камеры.');
    setIsLoading(false);
    if (onError) {
      onError(err);
    }
  };

  const toggleCamera = () => {
    setFacingMode(prevMode => prevMode === 'environment' ? 'user' : 'environment');
    setKey(prevKey => prevKey + 1); // Force QrReader to remount
    setIsLoading(true);
    setCameraError(null);
    
    // Reset loading after delay
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const toggleFlashlight = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode } 
      });
      const track = stream.getVideoTracks()[0];
      
      // Try to toggle flashlight
      if (track && typeof track.getCapabilities === 'function') {
        const capabilities = track.getCapabilities();
        
        if (capabilities.torch) {
          await track.applyConstraints({
            advanced: [{ torch: !isFlashlightOn }]
          });
          setIsFlashlightOn(!isFlashlightOn);
        } else {
          console.warn('Flashlight not available on this device');
        }
      }
    } catch (error) {
      console.error('Error toggling flashlight:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-4">
        <div className="relative">
          {cameraError ? (
            <div className="bg-red-50 p-4 rounded-lg text-red-800 mb-4">
              <p>{cameraError}</p>
              <Button 
                onClick={() => setCameraError(null)} 
                variant="destructive"
                className="mt-2 w-full"
              >
                Попробовать снова
              </Button>
            </div>
          ) : (
            <>
              <div className="relative rounded-lg overflow-hidden w-full aspect-square bg-black">
                <QrReader
                  key={key}
                  delay={100}
                  onError={handleError}
                  onScan={handleScan}
                  style={{ 
                    width: '100%'
                  }}
                  className="aspect-square"
                  constraints={{
                    video: {
                      facingMode: facingMode,
                      width: 640,
                      height: 640
                    }
                  }}
                  legacyMode={false}
                />
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <Spinner size={48} className="animate-spin text-primary" weight="bold" />
                  </div>
                )}
                <div className="absolute inset-0 border-2 border-primary/40 rounded-lg"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2/3 h-2/3 border-2 border-primary rounded-lg"></div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between gap-2">
                  <Button 
                    variant="outline" 
                    onClick={toggleCamera} 
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <CameraRotate className="h-4 w-4" />
                    {facingMode === 'environment' ? 'Фронтальная' : 'Основная'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={toggleFlashlight} 
                    className="flex-1"
                    disabled={facingMode === 'user'}
                  >
                    {isFlashlightOn ? 'Выключить фонарик' : 'Включить фонарик'}
                  </Button>
                </div>
                {onClose && (
                  <Button 
                    variant="ghost" 
                    onClick={onClose}
                    className="w-full"
                  >
                    Отмена
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QrScanner; 