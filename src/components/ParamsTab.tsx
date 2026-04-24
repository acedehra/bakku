import { memo } from "react";
import { KVEntry, Environment } from "../types";
import GenericKVTab, { GenericKVTabConfig } from "./GenericKVTab";

interface ParamsTabProps {
  paramEntries: KVEntry[];
  onParamEntriesChange: (entries: KVEntry[]) => void;
  activeEnv: Environment | null;
}

const paramsConfig: GenericKVTabConfig = {
  keyPlaceholder: "Key",
  valuePlaceholder: "Value",
  deleteAriaLabel: "Delete param",
  deleteTitle: "Delete param",
  addButtonText: "+ Add Param",
};

export function ParamsTab({
  paramEntries,
  onParamEntriesChange,
  activeEnv,
}: ParamsTabProps) {
  return (
    <GenericKVTab
      entries={paramEntries}
      onChange={onParamEntriesChange}
      activeEnv={activeEnv}
      config={paramsConfig}
    />
  );
}

export default memo(ParamsTab);
