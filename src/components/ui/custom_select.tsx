'use client'

import React from 'react';
import Select from 'react-select';

type Option = {
  value: string;
  label: string;
};

type Props = {
  label: string;
  placeholder: string;
  options: Option[];
  onChange: (value: string) => void;
};

export default function CustomSelect({ 
  label, 
  placeholder, 
  options,
  onChange 
}: Props)  {
  return (
    <div className="relative">
      {label && <label className="label mb-2 block text-ink/60">{label}</label>}
      <Select
        options={options}
        menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
        menuPosition="absolute"
        placeholder={placeholder}
        onChange={(selected) => selected && onChange(selected.value)}
        className="z-0 text-ink"
        styles={{
          control: (base, state) => ({
            ...base,
            backgroundColor: "#fff",
            borderRadius: 0,
            border: "1.5px solid var(--color-ink)",
            padding: "0.35rem 0.5rem",
            boxShadow: state.isFocused ? "4px 4px 0 0 var(--color-ink)" : "none",
            "&:hover": { borderColor: "var(--color-ink)" },
          }),
          placeholder: (base) => ({ ...base, color: "rgb(17 17 17 / 0.4)" }),
          singleValue: (base) => ({ ...base, color: "var(--color-ink)" }),
          input: (base) => ({ ...base, color: "var(--color-ink)" }),
          menuPortal: (base) => ({ ...base, zIndex: 10000 }),
          menu: (base) => ({
            ...base,
            backgroundColor: "var(--color-paper)",
            borderRadius: 0,
            border: "1.5px solid var(--color-ink)",
            boxShadow: "6px 6px 0 0 var(--color-ink)",
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? "var(--color-ink)" : state.isFocused ? "var(--color-lime)" : "transparent",
            color: state.isSelected ? "var(--color-paper)" : "var(--color-ink)",
            cursor: "pointer",
          }),
        }}
      />
    </div>
  );
}
