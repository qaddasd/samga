// Объявление типов для библиотек без файлов типов

// Объявление для html2pdf.js
declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | [number, number, number, number];
    filename?: string;
    image?: {
      type?: string;
      quality?: number;
    };
    html2canvas?: {
      scale?: number;
      useCORS?: boolean;
      [key: string]: any;
    };
    jsPDF?: {
      unit?: string;
      format?: string;
      orientation?: 'portrait' | 'landscape';
      [key: string]: any;
    };
    [key: string]: any;
  }

  interface Html2Pdf {
    from(element: HTMLElement | string): Html2Pdf;
    set(options: Html2PdfOptions): Html2Pdf;
    save(): Promise<void>;
    toPdf(): any;
    get(callback: Function): Html2Pdf;
    output(type: string, options?: any): any;
  }

  function html2pdf(): Html2Pdf;
  function html2pdf(element: HTMLElement | string, options?: Html2PdfOptions): Html2Pdf;

  export default html2pdf;
} 

// Объявление для exceljs (упрощенное)
declare module 'exceljs' {
  export interface Column {
    header?: string;
    key?: string;
    width?: number;
    style?: any;
  }

  export interface Cell {
    value: any;
    style: any;
    alignment?: {
      horizontal?: 'left' | 'center' | 'right';
      vertical?: 'top' | 'middle' | 'bottom';
    };
    border?: {
      top?: { style: 'thin' | 'medium' | 'thick' };
      bottom?: { style: 'thin' | 'medium' | 'thick' };
      left?: { style: 'thin' | 'medium' | 'thick' };
      right?: { style: 'thin' | 'medium' | 'thick' };
    };
    fill?: {
      type: 'pattern';
      pattern: 'solid';
      fgColor: { argb: string };
    };
    font?: {
      name?: string;
      size?: number;
      family?: number;
      scheme?: string;
      charset?: number;
      color?: { argb: string };
      bold?: boolean;
      italic?: boolean;
      underline?: boolean;
      strike?: boolean;
      outline?: boolean;
    };
    [key: string]: any;
  }

  export interface Row {
    getCell(index: number): Cell;
    eachCell(callback: (cell: Cell, colNumber: number) => void): void;
    values: any[];
    [key: string]: any;
  }

  export interface Worksheet {
    columns: Column[];
    addRow(values: any): Row;
    getRow(index: number): Row;
    eachRow(callback: (row: Row, rowNumber: number) => void): void;
    [key: string]: any;
  }

  export class Workbook {
    addWorksheet(name: string): Worksheet;
    xlsx: {
      writeBuffer(): Promise<Buffer>;
    };
    csv: {
      writeBuffer(): Promise<Buffer>;
    };
    [key: string]: any;
  }

  export default Workbook;
} 