import { useState, useMemo, useCallback } from "react";
import { KVEntry } from "../types";
import { getBaseUrl, parseUrlParamsOrdered, buildUrlWithOrderedParams } from "../utils/urlParser";

export function useUrl(initial: string) {
  const [url, setUrl] = useState(initial);
  
  const entries = useMemo(() => parseUrlParamsOrdered(url), [url]);
  
  const setEntries = useCallback((next: KVEntry[]) => {
    setUrl(buildUrlWithOrderedParams(getBaseUrl(url), next));
  }, [url]);

  return { 
    url, 
    setUrl, 
    paramEntries: entries, 
    setParamEntries: setEntries 
  };
}
