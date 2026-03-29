interface Option {
  value: string | number;
  label: string;
}

interface Props extends Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "value"
> {
  label: string;
  options: Option[];
  error?: string;
  value?: string | number;
  placeholder?: string;
}

export function SelectField({
  label,
  options,
  error,
  placeholder,
  ...selectProps
}: Props) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <select
        {...selectProps}
        className={`input-field ${error ? "!border-red-500" : ""}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
