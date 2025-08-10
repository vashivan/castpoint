
type Props = {
  width?: string,
  type?: string,
  label?: string;
  name?: string;
  placeholder?: string;
  value: number | string;
  onChange: (val: string) => void
}

export default function TextInput({ type, label, name, placeholder, value, onChange, width}: Props) {
  return (
    <>
      <label className="block text-xl text-black mb-2">{label}</label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={` ${!width ? `w-full` : 'w-80'} px-4 py-3 rounded-3xl bg-white/10 text-black placeholder-black border border-orange-500  focus:outline-none focus:ring-2 focus:ring-orange-300 text-center backdrop-blur-sm`}
        required
      />
    </>
  )
}