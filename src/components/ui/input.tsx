
type Props = {
  type?: string,
  label?: string;
  name?: string;
  placeholder?: string;
  value: number | string;
  onChange: (val: string) => void
}

export default function TextInput({ type, label, name, placeholder, value, onChange}: Props) {
  return (
    <>
      <label className="block text-xl text-white mb-2">{label}</label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-300 text-center"
        required
      />
    </>
  )
}