import { useState, useMemo } from "react";
import { RequestHistoryItem } from "../types";

interface HistorySidebarProps {
  history: RequestHistoryItem[];
  selectedId: string | null;
  onSelect: (item: RequestHistoryItem) => void;
}

export function HistorySidebar({
  history,
  selectedId,
  onSelect,
}: HistorySidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const query = searchQuery.toLowerCase();
    return history.filter(
      (item) =>
        item.url.toLowerCase().includes(query) ||
        item.method.toLowerCase().includes(query)
    );
  }, [history, searchQuery]);

  const getStatusColor = (status: number | null) => {
    if (!status) return "text-muted-foreground";
    if (status >= 200 && status < 300) return "text-green-500";
    if (status >= 300 && status < 400) return "text-yellow-500";
    if (status >= 400) return "text-red-500";
    return "text-muted-foreground";
  };

  const truncateUrl = (url: string, maxLength: number = 40) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + "...";
  };

  return (
    <div className="w-full h-screen flex flex-col bg-sidebar border-r border-sidebar-border">
      <div className="p-3 border-b border-sidebar-border">
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-8 px-2 rounded-md border border-sidebar-border bg-background text-foreground text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredHistory.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {searchQuery ? "No results found" : "No requests yet"}
          </div>
        ) : (
          <div className="p-2">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelect(item)}
                className={`p-2 mb-1 rounded-md cursor-pointer transition-colors ${
                  selectedId === item.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent/50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-sidebar-primary">
                    {item.method}
                  </span>
                  {item.status !== null && (
                    <span
                      className={`text-xs font-medium ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {truncateUrl(item.url)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
