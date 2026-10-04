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
      {label && <label htmlFor="bio" className="label mb-2 block text-ink/60">{label}</label>}
      <div className="mb-2 flex flex-col space-y-1.5 text-[14px] text-ink/70">
        {text ? (
          <p className="mb-2">
            {text}
          </p>
        ) : (
          <p></p>
        )}
      </div>
      <textarea
        className="w-full border-[1.5px] border-ink bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink/40 outline-none focus:shadow-[4px_4px_0_0_var(--color-ink)] transition-shadow"
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