'use client';

import React, { useRef, useState } from 'react';
import { Download, X, FileText, Image as ImageIcon } from 'lucide-react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { formatCurrency, CurrencyCode, CURRENCIES } from '@/store/use-budget-store';
import { cn } from '@/utils/cn';

export interface ExportRowItem {
  date: string;
  from: string; // Title / Person / Source
  categoryOrType: string;
  amount: number;
  currency: CurrencyCode;
  isPositive: boolean;
}

interface ExportTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  rows: ExportRowItem[];
  totalLabel?: string;
  totalValueStr?: string;
}

export function ExportTableModal({
  isOpen,
  onClose,
  title,
  subtitle = 'Financial Statement Report',
  rows,
}: ExportTableModalProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadPdf = async () => {
    try {
      setIsExporting(true);

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // 1. Document Header Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(17, 24, 39); // #111827
      doc.text(title, 14, 18);

      // 2. Subtitle & Metadata
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128); // #6B7280
      doc.text(subtitle, 14, 24);

      doc.setFontSize(9);
      doc.text(`Generated: ${new Date().toLocaleDateString()}  |  Total Records: ${rows.length}`, 14, 29);

      // 3. Table Rows Data
      const tableHeaders = [['Date', 'From / Title', 'Category / Type', 'Amount']];
      const tableBody = rows.map((row) => [
        row.date,
        row.from,
        row.categoryOrType,
        `${row.isPositive ? '+' : '-'}${formatCurrency(row.amount, row.currency)}`,
      ]);

      // 4. Render Clean Vector Table
      autoTable(doc, {
        startY: 34,
        head: tableHeaders,
        body: tableBody,
        theme: 'plain',
        styles: {
          font: 'helvetica',
          fontSize: 9,
          cellPadding: 3,
          textColor: [31, 41, 55],
          lineColor: [229, 231, 235],
          lineWidth: 0.2,
        },
        headStyles: {
          fillColor: [243, 244, 246], // Light gray header (#F3F4F6)
          textColor: [17, 24, 39],
          fontStyle: 'bold',
          fontSize: 9,
        },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 45 },
          3: { cellWidth: 45, halign: 'right', fontStyle: 'bold' },
        },
      });

      // 5. Summary Net Totals Section at Bottom of Table
      const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 220;

      // Check page overflow for summary
      const pageHeight = doc.internal.pageSize.getHeight();
      let currentY = finalY;
      if (currentY + 30 > pageHeight) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(17, 24, 39);
      doc.text('Net Totals Summary by Currency:', 14, currentY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(55, 65, 81);

      let summaryLineY = currentY + 6;
      (['USDT', 'THB', 'MMK', 'SGD'] as const).forEach((code) => {
        const val = totalsPerCurrency[code] || 0;
        const formatted = formatCurrency(val, code);
        const sign = val > 0 ? '+' : '';
        doc.text(`• ${code}: ${sign}${formatted}`, 14, summaryLineY);
        summaryLineY += 5;
      });

      doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF statement downloaded successfully!');
    } catch (err) {
      console.error('Failed to export PDF:', err);
      toast.error('Failed to generate PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPng = async () => {
    if (!tableRef.current) return;
    try {
      setIsExporting(true);
      // Wait for state change to expand full height DOM
      await new Promise((resolve) => setTimeout(resolve, 150));

      const dataUrl = await toPng(tableRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('PNG image downloaded successfully!');
    } catch (err) {
      console.error('Failed to export PNG:', err);
      toast.error('Failed to generate PNG image');
    } finally {
      setIsExporting(false);
    }
  };

  // Calculate 3 Separate Currency Totals
  const totalsPerCurrency = rows.reduce(
    (acc, row) => {
      const net = row.isPositive ? row.amount : -row.amount;
      acc[row.currency] = (acc[row.currency] || 0) + net;
      return acc;
    },
    { USDT: 0, THB: 0, MMK: 0, SGD: 0 } as Record<CurrencyCode, number>,
  );

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="z-[90] max-w-lg mx-auto bg-white dark:bg-zinc-900 text-gray-900 dark:text-white rounded-t-[36px] p-6 space-y-4 max-h-[90vh] h-auto overflow-y-auto shrink-0">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
          <DrawerTitle className="text-base font-black flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" /> Export Financial Statement
          </DrawerTitle>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-zinc-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* EXPORTABLE STATEMENT CANVAS NODE */}
        <div className="overflow-x-auto no-scrollbar py-2">
          <div
            ref={tableRef}
            className="w-[460px] mx-auto bg-gradient-to-br from-slate-900 via-zinc-900 to-zinc-950 text-white rounded-3xl p-6 shadow-2xl border border-zinc-800 space-y-5"
          >
            {/* Statement Header */}
            <div className="flex justify-between items-start border-b border-zinc-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">💰</span>
                  <h2 className="text-base font-black tracking-tight text-white">{title}</h2>
                </div>
                <p className="text-[11px] font-bold text-emerald-400 mt-0.5">{subtitle}</p>
              </div>

              <div className="text-right">
                <span className="px-2.5 py-1 rounded-xl bg-white/10 text-[10px] font-black text-gray-300 border border-white/10">
                  {rows.length} Records
                </span>
                <p className="text-[9px] text-gray-400 font-medium mt-1">
                  Generated {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Statement Table */}
            <div className="space-y-2">
              {/* Table Header Row */}
              <div className="grid grid-cols-12 gap-2 text-[10px] font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-800 pb-2 px-1">
                <span className="col-span-3">Date</span>
                <span className="col-span-5">From / Title</span>
                <span className="col-span-4 text-right">Amount</span>
              </div>

              {/* Table Body Rows */}
              {rows.length > 0 ? (
                <div
                  className={cn(
                    'space-y-2 pr-1',
                    !isExporting && 'max-h-[360px] overflow-y-auto',
                  )}
                >
                  {rows.map((row, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 text-xs py-2 px-1 rounded-xl bg-white/5 border border-white/5 items-center"
                    >
                      <span className="col-span-3 text-[11px] font-bold text-zinc-400 tabular-nums">
                        {row.date}
                      </span>
                      <div className="col-span-5 pr-1">
                        <p className="font-extrabold text-xs text-white truncate">{row.from}</p>
                        <span className="text-[9px] font-bold text-zinc-400 block">
                          {row.categoryOrType}
                        </span>
                      </div>
                      <span
                        className={cn(
                          'col-span-4 text-right font-black tabular-nums text-xs',
                          row.isPositive ? 'text-emerald-400' : 'text-rose-400',
                        )}
                      >
                        {row.isPositive ? '+' : '-'}
                        {formatCurrency(row.amount, row.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 font-bold text-center py-6">
                  No records to export.
                </p>
              )}
            </div>

            {/* Statement Footer Total Row - 4 SEPARATE CURRENCY TOTALS */}
            <div className="pt-3 border-t border-zinc-800 space-y-2">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider px-1">
                Net Totals by Currency
              </p>
              <div className="grid grid-cols-4 gap-2">
                {(['USDT', 'THB', 'MMK', 'SGD'] as const).map((code) => {
                  const val = totalsPerCurrency[code] || 0;
                  return (
                    <div
                      key={code}
                      className="bg-white/5 rounded-2xl p-2.5 border border-white/10 text-center"
                    >
                      <span className="text-[9px] font-black text-zinc-400 block uppercase">
                        {CURRENCIES[code].flag} {code}
                      </span>
                      <p
                        className={cn(
                          'text-xs font-black truncate mt-0.5 tabular-nums',
                          val > 0
                            ? 'text-emerald-400'
                            : val < 0
                            ? 'text-rose-400'
                            : 'text-zinc-300',
                        )}
                      >
                        {val > 0 ? '+' : ''}
                        {formatCurrency(val, code)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons: PDF (Primary) & PNG (Secondary) */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            disabled={isExporting || rows.length === 0}
            onClick={handleDownloadPdf}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-500/25 transition-all text-xs flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
          >
            {isExporting ? (
              <span>Generating PDF Document...</span>
            ) : (
              <>
                <FileText className="w-4 h-4" /> Download Statement (PDF)
              </>
            )}
          </button>

          <button
            type="button"
            disabled={isExporting || rows.length === 0}
            onClick={handleDownloadPng}
            className="w-full py-3 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200 font-bold rounded-2xl transition-all text-xs flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ImageIcon className="w-4 h-4 text-gray-500" /> Download Table Image (PNG)
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
