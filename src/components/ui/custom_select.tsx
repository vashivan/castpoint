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
    <div className="z-50 relative">
      <label className="block text-xl text-white mb-2">{label}</label>
      <Select
        options={options}
        menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
        menuPosition="absolute"
        placeholder={placeholder}
        onChange={(selected) => selected && onChange(selected.value)}
        className="text-white"
        styles={{
          control: (base, state) => ({
            ...base,
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            borderRadius: "0.75rem",
            border: "none",
            padding: "0.3rem 0.75rem",
            boxShadow: state.isFocused ? "0 0 0 2px #fb923c" : "none",
            color: "white",
          }),
          placeholder: (base) => ({
            ...base,
            color: "rgba(255, 255, 255, 0.6)",
          }),
          singleValue: (base) => ({
            ...base,
            color: "white",
          }),
          input: (base) => ({
            ...base,
            color: "white",
          }),
          menuPortal: (base) => ({
            ...base,
            zIndex: 9999,
          }),
          menu: (base) => ({
            ...base,
            backgroundColor: "rgba(30,30,30, 0.95)",
            borderRadius: "0.5rem",
            color: "white",
            textAlign: "center"
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
              ? "#fb923c"
              : state.isFocused
              ? "rgba(251, 146, 60, 0.2)"
              : "transparent",
            color: state.isSelected ? "black" : "white",
            cursor: "pointer",
          }),
        }}
      />
    </div>
  );
}
