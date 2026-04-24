import { useEffect, useCallback } from "react";
import { keyboardShortcuts, announceRequestSent } from "../../utils/accessibility";
import { HttpMethod } from "../../types";

interface KeyboardShortcutsOptions {
  method: HttpMethod;
  url: string;
  loading: boolean;
  onSend: () => void;
}

export function useKeyboardShortcuts({
  method,
  url,
  loading,
  onSend,
}: KeyboardShortcutsOptions) {
  const handleSend = useCallback(() => {
    announceRequestSent(method, url);
    onSend();
  }, [method, url, onSend]);

  useEffect(() => {
    const unregisterSend = keyboardShortcuts.register("CtrlOrCmd+Enter", () => {
      if (url.trim() && !loading) {
        handleSend();
      }
    });

    return () => {
      unregisterSend();
    };
  }, [url, loading, handleSend]);

  return { handleSend };
}
