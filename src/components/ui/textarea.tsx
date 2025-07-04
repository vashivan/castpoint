type Props = {
  label?: string;
  value: string;
  placeholder?: string;
  text?: string
  rows?: number | 20,
  onChange: (val: string) => void
}

export default function TextArea({ label, value, placeholder, text, onChange, rows }: Props) {
  return (
    <>
      <label htmlFor="bio" className="block text-xl text-white mb-2">{label}</label>
      <div className="text-white mb-2 text-s text-center flex flex-col space-y-1.5">
        {text ? (
          <p className="text-justify mb-4">
            {text}
          </p>
        ) : (
          <p></p>
        )}
      </div>
      <textarea
        className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-300 text-justify"
        name="bio"
        id="bio"
        cols={10}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      ></textarea>
    </>
  )
}