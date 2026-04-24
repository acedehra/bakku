import { useState, memo } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Environment, AuthConfig } from "../../../types";
import { VariableInput } from "../../VariableInput";

interface BasicAuthFormProps {
  auth: AuthConfig;
  environment: Environment | null;
  onChange: (auth: AuthConfig) => void;
}

function BasicAuthForm({ auth, environment, onChange }: BasicAuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <div className="p-3 rounded-lg border border-border/40 focus-within:border-primary/50 focus-within:bg-primary/5 transition-all shadow-sm">
        <label className="text-sm font-medium mb-2 block">Username</label>
        <VariableInput
          value={auth.username || ""}
          environment={environment}
          onChange={(val) => onChange({ ...auth, username: val })}
          className="w-full"
        />
      </div>
      <div className="p-3 rounded-lg border border-border/40 focus-within:border-primary/50 focus-within:bg-primary/5 transition-all shadow-sm">
        <label className="text-sm font-medium mb-2 block">Password</label>
        <div className="relative">
          <VariableInput
            value={auth.password || ""}
            environment={environment}
            onChange={(val) => onChange({ ...auth, password: val })}
            className="w-full"
            type={showPassword ? "text" : "password"}
            aria-label={showPassword ? "Password - visible" : "Password - hidden"}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
    </>
  );
}

export default memo(BasicAuthForm);
