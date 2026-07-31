'use client';

import React, { useState } from 'react';
import { ChevronLeft, Search, Check, Edit2, Plus, Trash2, X } from 'lucide-react';
import { useHabitStore } from '@/store/useHabitStore';
import { MOST_POPULAR_UNITS, CATEGORIZED_UNITS } from '@/features/habits/units/data';
import { cn } from '@/utils/cn';

interface UnitSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUnit?: string;
  onSelectUnit: (unit: string) => void;
}

import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';

export function UnitSelectorModal({
  isOpen,
  onClose,
  selectedUnit,
  onSelectUnit,
}: UnitSelectorModalProps) {
  const { customUnits, addCustomUnit, updateCustomUnit, deleteCustomUnit } = useHabitStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');
  const [editingUnitName, setEditingUnitName] = useState<string | null>(null);
  const [editInputValue, setEditInputValue] = useState('');

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitName.trim()) return;
    addCustomUnit(newUnitName.trim());
    onSelectUnit(newUnitName.trim());
    setNewUnitName('');
    setIsAddingCustom(false);
  };

  const handleStartEdit = (unit: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingUnitName(unit);
    setEditInputValue(unit);
  };

  const handleSaveEdit = (oldUnit: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!editInputValue.trim()) return;
    updateCustomUnit(oldUnit, editInputValue.trim());
    if (selectedUnit === oldUnit) {
      onSelectUnit(editInputValue.trim());
    }
    setEditingUnitName(null);
  };

  const handleDelete = (unit: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteCustomUnit(unit);
    if (selectedUnit === unit) {
      onSelectUnit('Count');
    }
  };

  const query = searchQuery.toLowerCase().trim();

  const filterUnits = (units: string[]) => {
    if (!query) return units;
    return units.filter((u) => u.toLowerCase().includes(query));
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="z-[70] max-w-lg mx-auto rounded-t-[36px] pb-8 max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <DrawerTitle className="text-lg font-bold text-gray-900 dark:text-white">Unit</DrawerTitle>
          <div className="w-9" />
        </div>

        {/* Scrollable Unit Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Custom Section */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
              Custom
            </span>
            <div className="bg-gray-50 dark:bg-zinc-800/60 rounded-2xl p-2 space-y-1">
              {isAddingCustom ? (
                <form onSubmit={handleCreateCustom} className="flex items-center gap-2 p-2">
                  <input
                    type="text"
                    value={newUnitName}
                    onChange={(e) => setNewUnitName(e.target.value)}
                    placeholder="Enter custom unit name..."
                    className="flex-1 px-3 py-2 text-sm rounded-xl border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-900 dark:text-white"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingCustom(false)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingCustom(true)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white dark:hover:bg-zinc-800 text-blue-600 dark:text-blue-400 font-semibold text-sm transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center">
                    <Edit2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span>Custom unit</span>
                  <Plus className="w-4 h-4 ml-auto" />
                </button>
              )}

              {/* User Custom Units CRUD List */}
              {customUnits.map((cUnit) => {
                const isSelected = selectedUnit === cUnit;
                const isEditing = editingUnitName === cUnit;

                if (isEditing) {
                  return (
                    <form
                      key={cUnit}
                      onSubmit={(e) => handleSaveEdit(cUnit, e)}
                      className="flex items-center gap-2 p-2 bg-white dark:bg-zinc-900 rounded-xl border border-blue-200"
                    >
                      <input
                        type="text"
                        value={editInputValue}
                        onChange={(e) => setEditInputValue(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-zinc-800 font-semibold"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="px-2.5 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg"
                      >
                        Save
                      </button>
                    </form>
                  );
                }

                return (
                  <div
                    key={cUnit}
                    onClick={() => {
                      onSelectUnit(cUnit);
                      onClose();
                    }}
                    className={cn(
                      'flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors',
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold'
                        : 'hover:bg-white dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 font-medium'
                    )}
                  >
                    <span>{cUnit}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleStartEdit(cUnit, e)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit unit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(cUnit, e)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete unit"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {isSelected && <Check className="w-4 h-4 text-emerald-500 ml-1 shrink-0" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Most Popular Section */}
          {filterUnits(MOST_POPULAR_UNITS).length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                Most popular
              </span>
              <div className="bg-gray-50 dark:bg-zinc-800/60 rounded-2xl overflow-hidden divide-y divide-gray-100 dark:divide-zinc-800">
                {filterUnits(MOST_POPULAR_UNITS).map((unit) => {
                  const isSelected = selectedUnit === unit;
                  return (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => {
                        onSelectUnit(unit);
                        onClose();
                      }}
                      className={cn(
                        'w-full flex items-center justify-between px-4 py-3.5 text-sm font-medium transition-colors text-left',
                        isSelected
                          ? 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold'
                          : 'hover:bg-white dark:hover:bg-zinc-800 text-gray-800 dark:text-gray-200'
                      )}
                    >
                      <span>{unit}</span>
                      {isSelected && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Categorized Sections */}
          {CATEGORIZED_UNITS.map((cat) => {
            const filtered = filterUnits(cat.units);
            if (filtered.length === 0) return null;

            return (
              <div key={cat.categoryName} className="space-y-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                  {cat.categoryName}
                </span>
                <div className="bg-gray-50 dark:bg-zinc-800/60 rounded-2xl overflow-hidden divide-y divide-gray-100 dark:divide-zinc-800">
                  {filtered.map((unit) => {
                    const isSelected = selectedUnit === unit;
                    return (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => {
                          onSelectUnit(unit);
                          onClose();
                        }}
                        className={cn(
                          'w-full flex items-center justify-between px-4 py-3.5 text-sm font-medium transition-colors text-left',
                          isSelected
                            ? 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold'
                            : 'hover:bg-white dark:hover:bg-zinc-800 text-gray-800 dark:text-gray-200'
                        )}
                      >
                        <span>{unit}</span>
                        {isSelected && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Fixed Search Bar at Bottom */}
        <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search unit..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-100 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
