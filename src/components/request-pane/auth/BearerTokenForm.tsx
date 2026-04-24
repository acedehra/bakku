import { useState, memo } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Environment, AuthConfig } from "../../../types";
import { VariableInput } from "../../VariableInput";

interface BearerTokenFormProps {
  auth: AuthConfig;
  environment: Environment | null;
  onChange: (auth: AuthConfig) => void;
}

function BearerTokenForm({ auth, environment, onChange }: BearerTokenFormProps) {
  const [showToken, setShowToken] = useState(false);

  return (
    <div className="p-3 rounded-lg border border-border/40 focus-within:border-primary/50 focus-within:bg-primary/5 transition-all shadow-sm">
      <label className="text-sm font-medium mb-2 block">Token</label>
      <div className="relative">
        <VariableInput
          value={auth.token || ""}
          environment={environment}
          onChange={(val) => onChange({ ...auth, token: val })}
          className="w-full"
          type={showToken ? "text" : "password"}
          aria-label={showToken ? "Token - visible" : "Token - hidden"}
        />
        <button
          type="button"
          onClick={() => setShowToken(!showToken)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={showToken ? "Hide token" : "Show token"}
          aria-pressed={showToken}
        >
          {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

export default memo(BearerTokenForm);
