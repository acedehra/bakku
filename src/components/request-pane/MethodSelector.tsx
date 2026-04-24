import { memo } from "react";
import { HttpMethod } from "../../types";

interface MethodSelectorProps {
  value: HttpMethod;
  onChange: (method: HttpMethod) => void;
}

function MethodSelector({ value, onChange }: MethodSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as HttpMethod)}
      className="h-10 rounded-md border border-input bg-background px-2 text-sm font-bold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
      aria-label="HTTP method"
    >
      {["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD"].map((m) => (
        <option key={m} value={m} className="font-sans">
          {m}
        </option>
      ))}
    </select>
  );
}

export default memo(MethodSelector);
