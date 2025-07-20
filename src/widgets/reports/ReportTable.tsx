import React, { FC, useEffect, useMemo, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import ResponsiveModal from '@/components/ui/responsive-modal'
import { Button } from '@/components/ui/button'
import { ReportCard } from '@/shared/types'
import ReportDetails from '@/widgets/reports/ReportDetails'
import { ArrowDown, FileSpreadsheet, FileText, Loader2 } from 'lucide-react'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { useToast } from '@/lib/providers/ToastProvider'
import { useState as useStateImport } from 'react'
import useSettingsStore from '@/lib/hooks/store/useSettingsStore'

// Выносим компонент FormattedMark наверх
export const FormattedMark = ({ mark }: { mark?: string }) => {
  if (!mark) return <span className="text-muted-foreground">-</span>

  const formattedMark = Number(mark)

  if (isNaN(formattedMark)) return <span>{mark.toUpperCase()}</span>

  let textColor = 'text-red-500'
  if (formattedMark === 4) textColor = 'text-yellow-500'
  else if (formattedMark === 5) textColor = 'text-green-500'

  return (
    <span className={`text-[16px] font-extrabold ${textColor}`}>
      {formattedMark}
    </span>
  )
}

const ReportTable: FC<{ reportCard?: ReportCard[number] }> = ({
  reportCard,
}) => {
  const { showToast } = useToast();
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);
  
  // Состояния для анимаций
  const [buttonsVisible, setButtonsVisible] = useState(false);
  const [tableVisible, setTableVisible] = useState(false);
  const [rowsVisible, setRowsVisible] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  
  // Получаем настройки GPA
  const { gpaSystem } = useSettingsStore();
  
  useEffect(() => {
    // Анимация появления элементов с задержкой
    const buttonsTimer = setTimeout(() => setButtonsVisible(true), 100);
    const tableTimer = setTimeout(() => setTableVisible(true), 300);
    const rowsTimer = setTimeout(() => setRowsVisible(true), 500);
    const footerTimer = setTimeout(() => setFooterVisible(true), 800);
    
    return () => {
      clearTimeout(buttonsTimer);
      clearTimeout(tableTimer);
      clearTimeout(rowsTimer);
      clearTimeout(footerTimer);
    };
  }, []);
  
  if (!reportCard) return <></>

  // Конвертация оценки в выбранную систему GPA
  const convertToSelectedGpa = (mark: string | number): number => {
    // Если не число, возвращаем 0
    if (isNaN(Number(mark))) return 0;
    
    const numericMark = Number(mark);
    
    // 4-балльная система
    if (gpaSystem === '4') {
      if (numericMark >= 4.5) return 4.0;
      if (numericMark >= 3.5) return 3.0;
      if (numericMark >= 2.5) return 2.0;
      if (numericMark >= 2.0) return 1.0;
      return 0.0;
    }
    
    // По умолчанию возвращаем оценку как есть (5-балльная)
    return numericMark;
  };

  const calculatedGPA = useMemo(() => {
    let sum = 0
    let count = 0

    reportCard.reportCard.forEach((report) => {
      const yearMark = Number(report.yearMark?.ru)
      if (!isNaN(yearMark)) {
        // Преобразуем оценку в выбранную систему GPA
        sum += convertToSelectedGpa(yearMark);
        count++
      }
    })

    return count !== 0 ? sum / count : 0
  }, [reportCard, gpaSystem])

  // Функции экспорта
  const handleExportPDF = async () => {
    try {
      setLoadingPDF(true);
      
      // Используем простой подход для мобильных устройств
      // Создаем таблицу напрямую через DOM API для большей совместимости
      const container = document.createElement('div');
      container.style.padding = '15px';
      container.style.fontFamily = 'Arial, sans-serif';
      
      // Создаем заголовок
      const header = document.createElement('div');
      header.style.backgroundColor = '#6AA9DF';
      header.style.color = 'white';
      header.style.padding = '15px';
      header.style.marginBottom = '15px';
      header.style.borderRadius = '5px 5px 0 0';
      
      // Создаем заголовок с текстом
      const title = document.createElement('h1');
      title.textContent = 'Табель успеваемости';
      title.style.margin = '0';
      title.style.fontSize = '20px';
      header.appendChild(title);
      
      // Добавляем заголовок в контейнер
      container.appendChild(header);
      
      // Добавляем информацию об учебном годе
      const infoBlock = document.createElement('div');
      infoBlock.style.marginBottom = '15px';
      
      const yearInfo = document.createElement('p');
      yearInfo.style.margin = '5px 0';
      yearInfo.innerHTML = `<strong>Учебный год:</strong> ${reportCard.schoolYear.name.ru}`;
      
      const gpaSystemInfo = document.createElement('p');
      gpaSystemInfo.style.margin = '5px 0';
      gpaSystemInfo.innerHTML = `<strong>Система GPA:</strong> ${gpaSystem}-балльная`;
      
      infoBlock.appendChild(yearInfo);
      infoBlock.appendChild(gpaSystemInfo);
      container.appendChild(infoBlock);
      
      // Создаем таблицу
      const table = document.createElement('table');
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      table.style.marginBottom = '15px';
      table.setAttribute('cellspacing', '0');
      table.setAttribute('cellpadding', '0');
      
      // Создаем заголовок таблицы
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      
      const headers = ['Предмет', 'I', 'II', 'III', 'IV', 'Год'];
      headers.forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        th.style.backgroundColor = '#6AA9DF';
        th.style.color = 'white';
        th.style.padding = '8px';
        th.style.fontWeight = 'bold';
        th.style.textAlign = 'center';
        th.style.border = '1px solid #4A89C0';
        headerRow.appendChild(th);
      });
      
      thead.appendChild(headerRow);
      table.appendChild(thead);
      
      // Создаем тело таблицы
      const tbody = document.createElement('tbody');
      
      // Добавляем строки предметов
      reportCard.reportCard.forEach((report, index) => {
        const row = document.createElement('tr');
        
        // Если четный индекс, добавляем фон
        if (index % 2 === 0) {
          row.style.backgroundColor = '#F2F9FF';
        }
        
        // Создаем ячейки
        const cells = [
          report.subject.name.ru,
          report.firstPeriod?.ru || '-',
          report.secondPeriod?.ru || '-',
          report.thirdPeriod?.ru || '-',
          report.fourthPeriod?.ru || '-',
          report.yearMark?.ru || '-'
        ];
        
        cells.forEach((text, cellIndex) => {
          const td = document.createElement('td');
          td.textContent = text;
          td.style.padding = '8px';
          td.style.border = '1px solid #ddd';
          
          // Выравнивание текста
          if (cellIndex === 0) {
            td.style.textAlign = 'left';
          } else {
            td.style.textAlign = 'center';
          }
          
          row.appendChild(td);
        });
        
        tbody.appendChild(row);
      });
      
      table.appendChild(tbody);
      
      // Создаем футер таблицы
      const tfoot = document.createElement('tfoot');
      const footerRow = document.createElement('tr');
      footerRow.style.backgroundColor = '#6AA9DF';
      footerRow.style.color = 'white';
      footerRow.style.fontWeight = 'bold';
      
      // Ячейка "Итог. GPA"
      const gpaLabelCell = document.createElement('td');
      gpaLabelCell.textContent = 'Итог. GPA';
      gpaLabelCell.style.textAlign = 'left';
      gpaLabelCell.style.border = '1px solid #4A89C0';
      gpaLabelCell.style.padding = '8px';
      
      // Пустые ячейки
      for (let i = 0; i < 4; i++) {
        const emptyCell = document.createElement('td');
        emptyCell.textContent = '';
        emptyCell.style.border = '1px solid #4A89C0';
        emptyCell.style.padding = '8px';
        footerRow.appendChild(emptyCell);
      }
      
      // Ячейка со значением GPA
      const gpaValueCell = document.createElement('td');
      gpaValueCell.textContent = calculatedGPA.toFixed(2);
      gpaValueCell.style.textAlign = 'center';
      gpaValueCell.style.border = '1px solid #4A89C0';
      gpaValueCell.style.padding = '8px';
      
      footerRow.appendChild(gpaLabelCell);
      footerRow.appendChild(gpaValueCell);
      
      tfoot.appendChild(footerRow);
      table.appendChild(tfoot);
      
      container.appendChild(table);
      
      // Создаем подпись
      const signature = document.createElement('div');
      signature.textContent = 'Сделано с сайта samga.top';
      signature.style.marginTop = '20px';
      signature.style.marginBottom = '20px';
      signature.style.color = '#6AA9DF';
      signature.style.fontStyle = 'italic';
      signature.style.textAlign = 'right';
      
      container.appendChild(signature);
      
      try {
        // Добавляем контейнер в DOM временно
        document.body.appendChild(container);
        
        // Используем html2pdf
        const html2pdfModule = await import('html2pdf.js');
        const html2pdf = html2pdfModule.default || html2pdfModule;
        
        const opt = {
          margin: 10,
          filename: `Табель_${reportCard.schoolYear.name.ru}_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`,
          image: { type: 'jpeg', quality: 1.0 },
          html2canvas: { 
            scale: 2,
            useCORS: true,
            logging: true,
            letterRendering: true,
            allowTaint: true
          },
          jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait' as 'portrait' | 'landscape',
            putOnlyUsedFonts: true
          }
        };
        
        console.log("Создаю PDF с данными:", {
          subjects: reportCard.reportCard.length,
          containerHTML: container.innerHTML.substring(0, 100) + "..."
        });
        
        html2pdf()
          .from(container)
          .set(opt)
          .save()
          .then(() => {
            // Удаляем временный контейнер
            document.body.removeChild(container);
            showToast('Файл PDF успешно скачан', 'success');
            setLoadingPDF(false);
          })
          .catch((error: any) => {
            document.body.removeChild(container);
            console.error("Ошибка при генерации PDF:", error);
            showToast('Не удалось сгенерировать PDF файл', 'error');
            setLoadingPDF(false);
          });
      } catch (pdfError) {
        // Удаляем временный контейнер в случае ошибки
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
        console.error("Ошибка при создании PDF:", pdfError);
        showToast('Ошибка при создании PDF', 'error');
        setLoadingPDF(false);
      }
    } catch (error) {
      console.error("Основная ошибка при экспорте в PDF:", error);
      showToast('Не удалось сгенерировать PDF файл', 'error');
      setLoadingPDF(false);
    }
  };
  
  // Функция для экспорта в Excel с базовым форматированием
  const handleExportExcel = async () => {
    try {
      setLoadingExcel(true);
      
      // Используем ExcelJS для более надежной работы с форматированием
      const ExcelJS = await import('exceljs');
      const Excel = ExcelJS;
      
      // Создаем новую рабочую книгу
      const workbook = new Excel.Workbook();
      const worksheet = workbook.addWorksheet('Табель успеваемости');
      
      // Задаем ширину столбцов
      worksheet.columns = [
        { header: 'Предмет', key: 'subject', width: 40 },
        { header: 'I', key: 'first', width: 8 },
        { header: 'II', key: 'second', width: 8 },
        { header: 'III', key: 'third', width: 8 },
        { header: 'IV', key: 'fourth', width: 8 },
        { header: 'Год', key: 'year', width: 8 }
      ];
      
      // Добавляем данные предметов
      reportCard.reportCard.forEach(report => {
        worksheet.addRow({
          subject: report.subject.name.ru,
          first: report.firstPeriod?.ru || "-",
          second: report.secondPeriod?.ru || "-",
          third: report.thirdPeriod?.ru || "-",
          fourth: report.fourthPeriod?.ru || "-",
          year: report.yearMark?.ru || "-"
        });
      });
      
      // Добавляем строку с GPA
      worksheet.addRow({
        subject: 'Итог. GPA',
        first: '',
        second: '',
        third: '',
        fourth: '',
        year: calculatedGPA.toFixed(2)
      });
      
      // Добавляем подпись сайта
      worksheet.addRow({});
      worksheet.addRow({
        subject: 'Сделано с сайта samga.top'
      });
      
      // Форматируем заголовок
      const headerRow = worksheet.getRow(1);
      headerRow.eachCell((cell: any) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF6AA9DF' } // Голубой цвет
        };
        cell.font = {
          color: { argb: 'FFFFFFFF' }, // Белый цвет
          bold: true
        };
        cell.alignment = { 
          horizontal: 'center',
          vertical: 'middle'
        };
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
      
      // Форматируем ячейки с данными
      for (let i = 2; i <= reportCard.reportCard.length + 1; i++) {
        const row = worksheet.getRow(i);
        
        // Форматируем названия предметов (выравнивание по левому краю)
        const subjectCell = row.getCell(1);
        subjectCell.alignment = {
          horizontal: 'left',
          vertical: 'middle'
        };
        subjectCell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        };
        
        // Форматируем оценки (центрирование)
        for (let j = 2; j <= 6; j++) {
          const gradeCell = row.getCell(j);
          gradeCell.alignment = {
            horizontal: 'center',
            vertical: 'middle'
          };
          gradeCell.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
          };
        }
        
        // Чередующиеся строки
        if (i % 2 === 0) {
          row.eachCell((cell: any) => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF2F9FF' } // Светло-голубой
            };
          });
        }
      }
      
      // Форматируем строку GPA
      const gpaRow = worksheet.getRow(reportCard.reportCard.length + 2);
      gpaRow.eachCell((cell: any) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF6AA9DF' } // Голубой цвет
        };
        cell.font = {
          color: { argb: 'FFFFFFFF' }, // Белый цвет
          bold: true
        };
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
      
      // Форматируем подпись сайта
      const signatureRow = worksheet.getRow(reportCard.reportCard.length + 4);
      const signatureCell = signatureRow.getCell(1);
      signatureCell.font = {
        color: { argb: 'FF6AA9DF' }, // Голубой цвет
        italic: true
      };
      
      // Сохраняем в буфер
      const buffer = await workbook.xlsx.writeBuffer();
      
      // Конвертируем буфер в Blob и сохраняем
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `Табель_${reportCard.schoolYear.name.ru}_${new Date().toLocaleDateString()}.xlsx`);
      
      showToast('Файл Excel успешно скачан', 'success');
    } catch (error) {
      console.error("Ошибка при экспорте в Excel:", error);
      showToast('Не удалось сгенерировать Excel файл', 'error');
    } finally {
      setLoadingExcel(false);
    }
  };

  return (
    <div className="opacity-100">
      <div 
        className={`mt-4 flex flex-wrap gap-2 sm:justify-end transition-all duration-500 transform ${
          buttonsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2 hover:scale-105 transition-transform"
            onClick={handleExportExcel}
            disabled={loadingExcel}
          >
            {loadingExcel ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
            <span>{loadingExcel ? 'Скачивание...' : 'Скачать в Excel'}</span>
          </Button>
        </div>
        
        <div>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2 hover:scale-105 transition-transform"
            onClick={handleExportPDF}
            disabled={loadingPDF}
          >
            {loadingPDF ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            <span>{loadingPDF ? 'Скачивание...' : 'Скачать в PDF'}</span>
          </Button>
        </div>
      </div>

      <div 
        className={`relative mt-5 overflow-hidden rounded-md border sm:border-0 transition-all duration-700 transform ${
          tableVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <Table className="overflow-x-auto">
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Предмет</TableHead>
              <TableHead className="min-w-[75px]">I</TableHead>
              <TableHead className="min-w-[75px]">II </TableHead>
              <TableHead className="min-w-[75px]">III</TableHead>
              <TableHead className="min-w-[75px]">IV</TableHead>
              <TableHead className="min-w-[75px]">Год</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className={`transition-opacity duration-700 ${rowsVisible ? 'opacity-100' : 'opacity-0'}`}>
            {reportCard?.reportCard.map((report, index) => (
              <ResponsiveModal
                key={`report-modal-${report.subject.id}`}
                trigger={
                  <tr
                    key={`report-${report.subject.id}`}
                    className={`hover:bg-secondary/5 transition-all duration-500 transform ${
                      rowsVisible 
                        ? 'opacity-100 translate-y-0' 
                        : 'opacity-0 translate-y-4'
                    }`}
                    style={{
                      transitionDelay: `${index * 50}ms`
                    }}
                  >
                    <TableCell className="max-w-[300px] overflow-visible whitespace-normal break-words">
                      <span className="hover:underline">
                        {report.subject.name.ru}
                      </span>
                    </TableCell>
                    <TableCell>
                      <FormattedMark mark={report.firstPeriod?.ru} />
                    </TableCell>
                    <TableCell>
                      <FormattedMark mark={report.secondPeriod?.ru} />
                    </TableCell>
                    <TableCell>
                      <FormattedMark mark={report.thirdPeriod?.ru} />
                    </TableCell>
                    <TableCell>
                      <FormattedMark mark={report.fourthPeriod?.ru} />
                    </TableCell>
                    <TableCell>
                      <FormattedMark mark={report.yearMark?.ru} />
                    </TableCell>
                  </tr>
                }
                title={
                  <span className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl">
                    {report.subject.name.ru}
                  </span>
                }
                description={<span>{reportCard?.schoolYear.name.ru}</span>}
                close={<Button variant="outline">Закрыть</Button>}
              >
                <ReportDetails report={report} />
              </ResponsiveModal>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow 
              className={`transition-all duration-700 transform ${
                footerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <TableCell colSpan={5}>Итог. GPA</TableCell>
              <TableCell>
                <span className="text-[18px] font-bold">
                  {calculatedGPA ? calculatedGPA.toFixed(2) : 'Н/Д'}
                </span>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
      
      <div className="mt-4 text-center text-xs text-muted-foreground">
        Сделано с сайта samga.top
      </div>
    </div>
  )
}

export default ReportTable
