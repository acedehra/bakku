interface SidebarSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function SidebarSearch({ value, onChange }: SidebarSearchProps) {
  return (
    <div className="p-3 border-b border-border">
      <input
        type="text"
        placeholder="Search requests..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-8 px-2 rounded-md border border-input bg-background text-foreground text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  );
}
