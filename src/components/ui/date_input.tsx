'use client';

import React from 'react';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import { enGB } from 'date-fns/locale';

type Props = {
  label: string;
  name: string;
  value: string;
  onChange: (val: string) => void;
};

export default function DateInput({ label, name, value, onChange }: Props) {
  const selectedDate = value ? parseDate(value) : null;

  const handleChange = (date: Date | null) => {
    if (date) {
      const formatted = format(date, 'yyyy-MM-dd');
      onChange(formatted);
    } else {
      onChange('');
    }
  };

  return (
    <div className="w-full">
      <label className="block text-xl text-white mb-2">{label}</label>
      <DatePicker
        selected={selectedDate}
        onChange={handleChange}
        dateFormat="yyyy-MM-dd"
        placeholderText="YYYY.MM.DD"
        locale={enGB}
        name={name}
        className="w-100 px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-300 text-center"
        showYearDropdown
        scrollableYearDropdown
        yearDropdownItemNumber={100}
      />
    </div>
  );
}

// Допоміжна функція: парсить DD.MM.YYYY
function parseDate(dateString: string): Date | null {
  const [year, month, day] = dateString.split('-');
  if (!year || !month || !day) return null;
  return new Date(Number(year), Number(month) - 1, Number(day));
}
