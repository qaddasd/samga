'use client';

import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExpirationOption, QrTokenData, generateQrToken, storeQrToken } from '@/lib/token/qr-auth';
import { Clock, ShareNetwork } from '@phosphor-icons/react';

interface QrGeneratorProps {
  onGenerate?: (tokenData: QrTokenData) => void;
}

const QrGenerator: React.FC<QrGeneratorProps> = ({ onGenerate }) => {
  const [qrValue, setQrValue] = useState<string>('');
  const [tokenData, setTokenData] = useState<QrTokenData | null>(null);
  const [expirationOption, setExpirationOption] = useState<ExpirationOption>('1hour');
  const [countdown, setCountdown] = useState<number>(0);
  
  // Generate a new QR code with the selected expiration option
  const generateNewQrCode = () => {
    const newTokenData = generateQrToken(expirationOption);
    setTokenData(newTokenData);
    setQrValue(JSON.stringify({
      token: newTokenData.token,
      timestamp: new Date().getTime()
    }));
    
    // Store token in localStorage
    storeQrToken(newTokenData);
    
    // Call the onGenerate callback if provided
    if (onGenerate) {
      onGenerate(newTokenData);
    }
  };
  
  // Auto-generate QR code on component mount
  useEffect(() => {
    generateNewQrCode();
    
    // Set up timer to regenerate QR code every minute
    const intervalId = setInterval(() => {
      generateNewQrCode();
    }, 60000); // 1 minute
    
    return () => clearInterval(intervalId);
  }, [expirationOption]); // Re-run when expiration option changes
  
  // Update countdown timer
  useEffect(() => {
    if (!tokenData || !tokenData.expiresAt) {
      setCountdown(0);
      return;
    }
    
    const updateCountdown = () => {
      const now = new Date();
      const expiresAt = new Date(tokenData.expiresAt!);
      const diff = expiresAt.getTime() - now.getTime();
      
      if (diff <= 0) {
        setCountdown(0);
        return;
      }
      
      const seconds = Math.floor(diff / 1000);
      setCountdown(seconds);
    };
    
    // Initial update
    updateCountdown();
    
    // Update countdown every second
    const intervalId = setInterval(updateCountdown, 1000);
    return () => clearInterval(intervalId);
  }, [tokenData]);
  
  // Format countdown for display
  const formatCountdown = () => {
    if (countdown <= 0 || !tokenData?.expiresAt) return 'Бессрочно';
    
    const hours = Math.floor(countdown / 3600);
    const minutes = Math.floor((countdown % 3600) / 60);
    const seconds = countdown % 60;
    
    if (hours > 0) {
      return `${hours}ч ${minutes}м`;
    } else {
      return `${minutes}м ${seconds}с`;
    }
  };
  
  // Share the QR code (if Web Share API is available)
  const shareQrCode = async () => {
    if (tokenData && navigator.share) {
      try {
        await navigator.share({
          title: 'Вход в samga.nis',
          text: 'Отсканируйте QR-код для входа в аккаунт',
          url: window.location.origin + '/login?token=' + tokenData.token
        });
      } catch (error) {
        console.error('Error sharing QR code:', error);
      }
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-4 flex flex-col items-center">
        <div className="mb-4 w-full">
          <Select value={expirationOption} onValueChange={(value: ExpirationOption) => setExpirationOption(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Время действия" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30min">30 минут</SelectItem>
              <SelectItem value="1hour">1 час</SelectItem>
              <SelectItem value="never">Бессрочно</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="border-4 border-primary/20 rounded-xl p-4 mb-4 bg-white dark:bg-slate-800">
          <QRCodeSVG
            value={qrValue}
            size={250}
            level="H" // High error correction level
            includeMargin={true}
            bgColor="transparent"
            fgColor="currentColor"
            className="text-black dark:text-white"
          />
        </div>
        
        <div className="w-full flex flex-col gap-2">
          <div className="flex items-center justify-between mb-2 p-2 bg-muted rounded-md">
            <div className="flex items-center gap-2">
              <Clock size={20} className="text-primary" />
              <span className="text-sm font-medium">Время действия:</span>
            </div>
            <span className="font-medium text-primary">
              {formatCountdown()}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={generateNewQrCode} 
              variant="outline" 
              className="w-full"
            >
              Обновить
            </Button>
            
            <Button 
              onClick={shareQrCode} 
              variant="outline" 
              className="w-full"
              disabled={!navigator.share}
            >
              <ShareNetwork size={18} className="mr-2" />
              Поделиться
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center mt-2">
            QR-код автоматически обновляется каждую минуту
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QrGenerator; 