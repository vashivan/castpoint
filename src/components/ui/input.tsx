
type Props = {
  classname?: string,
  width?: string,
  type?: string,
  label?: string;
  name?: string;
  placeholder?: string;
  value: number | string;
  onChange: (val: string) => void,
  autoComplete?: string,
  onBlur?: () => void
}

export default function TextInput({ type, label, name, placeholder, value, onChange, width, autoComplete, onBlur, classname}: Props) {
  return (
    <>
      {label && <label className="label mb-2 block text-ink/60">{label}</label>}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border-[1.5px] border-ink bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink/40 outline-none focus:shadow-[4px_4px_0_0_var(--color-ink)] transition-shadow ${width ? 'max-w-80' : ''} ${classname ?? ''}`}
        autoComplete={autoComplete}
        onBlur={onBlur}
        required
      />
    </>
  )
}