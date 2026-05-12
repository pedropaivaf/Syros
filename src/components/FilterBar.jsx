import React, { useState } from 'react';
import DateRangePicker from './DateRangePicker.jsx';
import MonthScrollPicker from './MonthScrollPicker.jsx';
import { useTranslation } from '../i18n/index.jsx';

function FilterBar({ currentFilter, onChange, dateRange, onDateRangeChange, selectedMonth, onMonthChange, showTitle = true }) {
  const { t } = useTranslation();
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleMonthClick = () => {
    if (currentFilter !== 'month') {
      onChange('month');
      if (onDateRangeChange) onDateRangeChange({ from: null, to: null });
    }
    setPickerOpen(true);
  };

  const handleMonthSelect = (month) => {
    onMonthChange(month);
    onChange('month');
    if (onDateRangeChange) onDateRangeChange({ from: null, to: null });
    setPickerOpen(false);
  };

  const handleDateRangeChange = (range) => {
    if (onDateRangeChange) onDateRangeChange(range);
    if (range.from && range.to) {
      onChange('range');
    } else if (currentFilter === 'range') {
      onChange('month');
    }
  };

  const monthLabel = selectedMonth
    ? `${t(`months.${selectedMonth.month}`)} ${selectedMonth.year}`
    : t('filter.month');

  const isMonthActive = currentFilter === 'month';
  const isCycleActive = currentFilter === 'cycle';

  const handleCycleClick = () => {
    onChange('cycle');
    if (onDateRangeChange) onDateRangeChange({ from: null, to: null });
  };

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      {showTitle && (
        <div>
          <h2 className="text-xl font-bold font-display text-[#1A1A1A] dark:text-[#E8E4DF]">{t('page.history.title')}</h2>
        </div>
      )}
      <div id="filter-container" className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={handleMonthClick}
          className={`filter-btn flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] text-sm font-medium rounded-lg transition ${
            isMonthActive
              ? 'bg-[#1B4965] dark:bg-[#5FA8D3] text-white shadow-sm'
              : 'bg-[#F4F3EF] dark:bg-[#1A1918] text-[#6B6B6B] dark:text-[#A09A92] hover:bg-[#E8E5E0] dark:hover:bg-[#2D2B28]'
          }`}
        >
          <span className="capitalize">{monthLabel}</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={handleCycleClick}
          className={`filter-btn px-3 py-1.5 min-h-[44px] text-sm font-medium rounded-lg transition ${
            isCycleActive
              ? 'bg-[#1B4965] dark:bg-[#5FA8D3] text-white shadow-sm'
              : 'bg-[#F4F3EF] dark:bg-[#1A1918] text-[#6B6B6B] dark:text-[#A09A92] hover:bg-[#E8E5E0] dark:hover:bg-[#2D2B28]'
          }`}
        >
          {t('filter.cycle')}
        </button>
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
        />
      </div>
      <MonthScrollPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selectedMonth={selectedMonth || { year: new Date().getFullYear(), month: new Date().getMonth() }}
        onSelect={handleMonthSelect}
      />
    </div>
  );
}

export default FilterBar;
