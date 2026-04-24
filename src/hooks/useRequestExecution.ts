import { useState } from "react";
import { HttpMethod, ResponseData, AuthConfig, Environment, KVEntry } from "../types";
import { executeHttpRequest, formatError } from "../utils/httpClient";

interface UseRequestExecutionResult {
    loading: boolean;
    error: string | null;
    response: ResponseData | null;
    executeRequest: (
        method: HttpMethod,
        url: string,
        headers: KVEntry[],
        body: string,
        auth: AuthConfig,
        activeEnv: Environment | null
    ) => Promise<ResponseData | null>;
    clearError: () => void;
    clearResponse: (response?: ResponseData | null) => void;
}

export function useRequestExecution(): UseRequestExecutionResult {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [response, setResponse] = useState<ResponseData | null>(null);

    const executeRequest = async (
        method: HttpMethod,
        url: string,
        headers: KVEntry[],
        body: string,
        auth: AuthConfig,
        activeEnv: Environment | null
    ): Promise<ResponseData | null> => {
        setLoading(true);
        setError(null);
        setResponse(null);

        try {
            const responseData = await executeHttpRequest(
                method,
                url,
                headers,
                body,
                auth,
                activeEnv
            );
            setResponse(responseData);
            return responseData;
        } catch (err) {
            const errorMessage = formatError(err);
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const clearError = (error: string | null = null): void => {
        setError(error);
    };

    const clearResponse = (next: ResponseData | null = null): void => {
        setResponse(next);
    };

    return {
        loading,
        error,
        response,
        executeRequest,
        clearError,
        clearResponse,
    };
}
