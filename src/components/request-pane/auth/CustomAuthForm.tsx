import { memo } from "react";
import { Environment, AuthConfig } from "../../../types";
import { VariableInput } from "../../VariableInput";

interface CustomAuthFormProps {
  auth: AuthConfig;
  environment: Environment | null;
  onChange: (auth: AuthConfig) => void;
}

function CustomAuthForm({ auth, environment, onChange }: CustomAuthFormProps) {
  return (
    <>
      <div className="p-3 rounded-lg border border-border/40 focus-within:border-primary/50 focus-within:bg-primary/5 transition-all shadow-sm">
        <label className="text-sm font-medium mb-2 block">Header Name</label>
        <VariableInput
          value={auth.headerName || ""}
          environment={environment}
          onChange={(val) => onChange({ ...auth, headerName: val })}
          className="w-full"
        />
      </div>
      <div className="p-3 rounded-lg border border-transparent focus-within:border-accent focus-within:bg-accent/10 transition-all">
        <label className="text-sm font-medium mb-2 block">Header Value</label>
        <VariableInput
          value={auth.headerValue || ""}
          environment={environment}
          onChange={(val) => onChange({ ...auth, headerValue: val })}
          className="w-full"
        />
      </div>
    </>
  );
}

export default memo(CustomAuthForm);
