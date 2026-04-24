import { memo } from "react";
import { Environment } from "../../types";
import { VariableInput } from "../VariableInput";

interface UrlInputProps {
  value: string;
  environment: Environment | null;
  onChange: (value: string) => void;
  onClick?: () => void;
  className?: string;
}

function UrlInput({ value, environment, onChange, onClick, className }: UrlInputProps) {
  return (
    <VariableInput
      value={value}
      environment={environment}
      onClick={onClick}
      onChange={onChange}
      placeholder="https://api.example.com/resource"
      className={className}
      aria-label="Request URL"
    />
  );
}

export default memo(UrlInput);
