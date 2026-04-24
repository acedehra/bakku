import { memo } from "react";
import { KVEntry, Environment } from "../types";
import GenericKVTab, { GenericKVTabConfig } from "./GenericKVTab";

interface HeadersTabProps {
  headers: KVEntry[];
  onHeadersChange: (headers: KVEntry[]) => void;
  activeEnv: Environment | null;
}

const headersConfig: GenericKVTabConfig = {
  keyPlaceholder: "Header name",
  valuePlaceholder: "Header value",
  deleteAriaLabel: "Delete header",
  deleteTitle: "Delete header",
  addButtonText: "+ Add Header",
};

export function HeadersTab({
  headers,
  onHeadersChange,
  activeEnv,
}: HeadersTabProps) {
  return (
    <GenericKVTab
      entries={headers}
      onChange={onHeadersChange}
      activeEnv={activeEnv}
      config={headersConfig}
    />
  );
}

export default memo(HeadersTab);
