declare module 'react-qr-scanner' {
  import { ReactNode, Component } from 'react'
  
  export interface QrScannerProps {
    delay?: number | false
    style?: object
    className?: string
    onError?: (error: Error) => void
    onScan?: (data: { text: string } | null) => void
    onLoad?: () => void
    onImageLoad?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void
    facingMode?: 'user' | 'environment'
    legacyMode?: boolean
    maxImageSize?: number
    chooseDeviceId?: () => string
    constraints?: {
      video: {
        facingMode?: 'user' | 'environment'
        width?: number
        height?: number
      }
      audio?: boolean
    }
  }
  
  export default class QrScanner extends Component<QrScannerProps> {
    openImageDialog: () => void
  }
} 