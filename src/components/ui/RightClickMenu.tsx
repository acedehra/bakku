import * as ContextMenu from "@radix-ui/react-context-menu";
import { ReactNode } from "react";

export interface MenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  destructive?: boolean;
  onSelect: () => void;
}

interface RightClickMenuProps {
  children: ReactNode;
  items: MenuItem[];
  disabled?: boolean;
}

export function RightClickMenu({ children, items, disabled = false }: RightClickMenuProps) {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        {children}
      </ContextMenu.Trigger>
      {!disabled && (
        <ContextMenu.Portal>
          <ContextMenu.Content className="min-w-[180px] bg-popover text-popover-foreground border border-border rounded-md shadow-md p-1 z-50">
            {items.map((item) => (
              <ContextMenu.Item
                key={item.id}
                onSelect={item.onSelect}
                className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:opacity-50 data-[disabled]:pointer-events-none ${
                  item.destructive ? "hover:text-destructive focus:text-destructive" : ""
                }`}
              >
                {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                {item.label}
              </ContextMenu.Item>
            ))}
          </ContextMenu.Content>
        </ContextMenu.Portal>
      )}
    </ContextMenu.Root>
  );
}
