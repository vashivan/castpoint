'use client';

import React from 'react';
import DatePicker from 'react-datepicker';
import { parseISO, isValid, format } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';

type Props = {
  label?: string;
  name?: string;
  value?: string | Date | null;   // приймаємо рядок 'yyyy-MM-dd', Date або null
  onChange: (val: string) => void; // віддаємо рядок 'yyyy-MM-dd' або '' якщо очищено
  placeholder?: string;
  min?: string | Date | null;
  max?: string | Date | null;
  className?: string;
};

function normalizeIn(v: Props['value']): Date | null {
  if (!v) return null;

  if (v instanceof Date) return isValid(v) ? v : null;

  // рядок
  const s = String(v).trim();
  // MySQL "zero date" та порожнє
  if (!s || s === '0000-00-00' || s.toLowerCase() === 'invalid date') return null;

  // формат 'yyyy-MM-dd'
  if (s.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const d = parseISO(s);               // парсимо безпечно
    return isValid(d) ? d : null;
  }

  // інші формати пробуємо нативно
  const d2 = new Date(s);
  return isValid(d2) ? d2 : null;
}

function normalizeLimit(v: Props['min']): Date | undefined {
  if (!v) return undefined;
  if (v instanceof Date) return isValid(v) ? v : undefined;
  const s = String(v).trim();
  if (!s || s === '0000-00-00') return undefined;
  if (s.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const d = parseISO(s);
    return isValid(d) ? d : undefined;
  }
  const d2 = new Date(s);
  return isValid(d2) ? d2 : undefined;
}

export default function DateInput({
  label,
  name,
  value,
  onChange,
  placeholder = 'YYYY-MM-DD',
  min,
  max,
  className = '',
}: Props) {
  const selectedDate = normalizeIn(value);

  return (
    <>
      <div className={`flex flex-col w-full ${className}`}>
        {label && (
          <label htmlFor={name} className="block text-m text-black mb-2">
            {label}
          </label>
        )}
        <DatePicker
          id={name}
          selected={selectedDate || null}
          onChange={(d: Date | null) => onChange(d ? format(d, 'yyyy-MM-dd') : '')}
          dateFormat="yyyy-MM-dd"
          placeholderText={placeholder}
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          minDate={normalizeLimit(min)}
          maxDate={normalizeLimit(max)}
          className="w-full border-b rounded-3xl py-2 px-4 bg-white/70 focus:outline-none focus:ring-2 focus:ring-orange-500 text-center"
        />
      </div>
    </>
  );
}
