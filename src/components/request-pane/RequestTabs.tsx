import { memo } from "react";
import { FileText, List, Settings, ShieldCheck } from "lucide-react";

export type RequestTab = "Body" | "Params" | "Headers" | "Auth";

interface RequestTabsProps {
  activeTab: RequestTab;
  onChange: (tab: RequestTab) => void;
  paramCount: number;
  headerCount: number;
}

function RequestTabs({ activeTab, onChange, paramCount, headerCount }: RequestTabsProps) {
  const tabs: RequestTab[] = ["Body", "Params", "Headers", "Auth"];

  const tabIcons: Record<RequestTab, React.ReactNode> = {
    Body: <FileText size={14} />,
    Params: <List size={14} />,
    Headers: <Settings size={14} />,
    Auth: <ShieldCheck size={14} />,
  };

  return (
    <div className="flex gap-1 border-b border-border">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        const count = tab === "Params" ? paramCount : tab === "Headers" ? headerCount : 0;
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-extrabold transition-all duration-300 outline-none ${
              isActive
                ? "text-primary-foreground bg-primary shadow-xl rounded-lg scale-[1.02]"
                : "text-muted-foreground/30 hover:text-muted-foreground/60 hover:bg-accent/10"
            }`}
          >
            <span className={`transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-30"}`}>
              {tabIcons[tab]}
            </span>
            <span className={`transition-all duration-300 ${isActive ? "opacity-100" : "opacity-30"}`}>
              {tab}
            </span>
            {count > 0 && (
              <span
                className={`inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 text-[10px] font-bold rounded-full transition-all ${
                  isActive ? "bg-primary-foreground text-primary shadow-sm" : "bg-muted/20 text-muted-foreground/20"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default memo(RequestTabs);
