import { memo } from "react";
import { AuthType, Environment, AuthConfig } from "../../../types";
import BasicAuthForm from "./BasicAuthForm";
import BearerTokenForm from "./BearerTokenForm";
import CustomAuthForm from "./CustomAuthForm";

interface AuthTabProps {
  auth: AuthConfig;
  environment: Environment | null;
  onChange: (auth: AuthConfig) => void;
}

function AuthTab({ auth, environment, onChange }: AuthTabProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Auth Type</label>
        <select
          value={auth.type}
          onChange={(e) => onChange({ ...auth, type: e.target.value as AuthType })}
          className={`w-full h-10 rounded-md border text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all ${
            auth.type !== "None"
              ? "border-primary/50 bg-primary/5 text-primary"
              : "border-input bg-background"
          }`}
        >
          <option value="None">None</option>
          <option value="Basic">Basic Auth</option>
          <option value="Bearer">Bearer Token</option>
          <option value="Custom">Custom Header</option>
        </select>
      </div>
      {auth.type === "Basic" && (
        <BasicAuthForm auth={auth} environment={environment} onChange={onChange} />
      )}
      {auth.type === "Bearer" && (
        <BearerTokenForm auth={auth} environment={environment} onChange={onChange} />
      )}
      {auth.type === "Custom" && (
        <CustomAuthForm auth={auth} environment={environment} onChange={onChange} />
      )}
    </div>
  );
}

export default memo(AuthTab);
