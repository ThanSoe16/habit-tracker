'use client';

import React, { useRef, useState } from 'react';
import { Download, X, Image as ImageIcon } from 'lucide-react';
import { toPng } from 'html-to-image';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { formatCurrency, CurrencyCode, CURRENCIES } from '@/store/useBudgetStore';
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
  totalLabel,
  totalValueStr,
}: ExportTableModalProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = async () => {
    if (!tableRef.current) return;
    try {
      setIsExporting(true);
      const dataUrl = await toPng(tableRef.current, {
        cacheBust: true,
        pixelRatio: 2, // High resolution image export
      });
      const link = document.createElement('a');
      link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image:', err);
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
    { USDT: 0, THB: 0, MMK: 0 } as Record<CurrencyCode, number>,
  );

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="z-[90] max-w-lg mx-auto bg-white dark:bg-zinc-900 text-gray-900 dark:text-white rounded-t-[36px] p-6 space-y-4 max-h-[90vh] h-auto overflow-y-auto shrink-0">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
          <DrawerTitle className="text-base font-black flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-emerald-600" /> Export Table Image
          </DrawerTitle>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-zinc-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* EXPORTABLE STATEMENT IMAGE CANVAS NODE */}
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
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
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

            {/* Statement Footer Total Row - 3 SEPARATE CURRENCY TOTALS */}
            <div className="pt-3 border-t border-zinc-800 space-y-2">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider px-1">
                Net Totals by Currency
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(['USDT', 'THB', 'MMK'] as const).map((code) => {
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

        {/* Action Button */}
        <button
          type="button"
          disabled={isExporting || rows.length === 0}
          onClick={handleDownload}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-500/25 transition-all text-xs flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isExporting ? (
            <span>Generating Image...</span>
          ) : (
            <>
              <Download className="w-4 h-4" /> Download Table Image (PNG)
            </>
          )}
        </button>
      </DrawerContent>
    </Drawer>
  );
}
