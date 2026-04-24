/**
 * Import/Export Utilities
 *
 * Provides functionality to export and import application data
 * such as environments and request history.
 */

import { Environment } from "../types";

/**
 * Export data structure
 */
export interface ExportData {
    version: string;
    exportedAt: string;
    environments?: Environment[];
    history?: any[];
}

/**
 * Export options
 */
export interface ExportOptions {
    includeEnvironments?: boolean;
    includeHistory?: boolean;
}

/**
 * Import result
 */
export interface ImportResult {
    success: boolean;
    message: string;
    imported: {
        environments: number;
        historyItems: number;
    };
}

/**
 * Validation result for import data
 */
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

/**
 * Current export schema version
 */
const CURRENT_SCHEMA_VERSION = "1.0.0";

/**
 * Validate import data structure
 */
function validateImportData(data: unknown): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if data is an object
    if (typeof data !== "object" || data === null) {
        return {
            isValid: false,
            errors: ["Import data must be a valid object"],
            warnings: [],
        };
    }

    const importData = data as Record<string, unknown>;

    // Check version
    if (!importData.version || typeof importData.version !== "string") {
        errors.push("Missing or invalid version");
    } else if (importData.version !== CURRENT_SCHEMA_VERSION) {
        warnings.push(
            `Import data version ${importData.version} differs from current version ${CURRENT_SCHEMA_VERSION}`
        );
    }

    // Check exportedAt
    if (!importData.exportedAt || typeof importData.exportedAt !== "string") {
        errors.push("Missing or invalid exportedAt timestamp");
    }

    // Validate environments if present
    if (importData.environments) {
        if (!Array.isArray(importData.environments)) {
            errors.push("Environments must be an array");
        } else {
            importData.environments.forEach((env: unknown, index: number) => {
                if (typeof env !== "object" || env === null) {
                    errors.push(`Environment at index ${index} is invalid`);
                } else {
                    const envObj = env as Record<string, unknown>;
                    if (!envObj.id || typeof envObj.id !== "string") {
                        errors.push(`Environment at index ${index} missing id`);
                    }
                    if (!envObj.name || typeof envObj.name !== "string") {
                        errors.push(`Environment at index ${index} missing name`);
                    }
                    if (!Array.isArray(envObj.variables)) {
                        errors.push(`Environment at index ${index} has invalid variables`);
                    }
                }
            });
        }
    }

    // Validate history if present
    if (importData.history) {
        if (!Array.isArray(importData.history)) {
            errors.push("History must be an array");
        } else {
            importData.history.forEach((item: unknown, index: number) => {
                if (typeof item !== "object" || item === null) {
                    errors.push(`History item at index ${index} is invalid`);
                } else {
                    const itemObj = item as Record<string, unknown>;
                    if (!itemObj.id || typeof itemObj.id !== "string") {
                        errors.push(`History item at index ${index} missing id`);
                    }
                    if (!itemObj.method || typeof itemObj.method !== "string") {
                        errors.push(`History item at index ${index} missing method`);
                    }
                    if (!itemObj.url || typeof itemObj.url !== "string") {
                        errors.push(`History item at index ${index} missing url`);
                    }
                    // Validate headers/params - can be Record or Array during transition
                    const rd = itemObj.requestData as Record<string, unknown>;
                    if (rd) {
                        if (rd.headers && typeof rd.headers !== "object") {
                            errors.push(`History item at index ${index} has invalid headers`);
                        }
                    }
                }
            });
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Export application data to JSON
 */
export function exportData(options: ExportOptions = {}): string {
    const exportData: ExportData = {
        version: CURRENT_SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
    };

    // Get environments from localStorage
    if (options.includeEnvironments !== false) {
        try {
            const envData = localStorage.getItem("bakku_environments");
            if (envData) {
                exportData.environments = JSON.parse(envData);
            }
        } catch (error) {
            console.error("Failed to export environments:", error);
        }
    }

    // Get history from localStorage
    if (options.includeHistory !== false) {
        try {
            const historyData = localStorage.getItem("bakku_request_history");
            if (historyData) {
                exportData.history = JSON.parse(historyData);
            }
        } catch (error) {
            console.error("Failed to export history:", error);
        }
    }

    return JSON.stringify(exportData, null, 2);
}

/**
 * Download export data as a file
 */
export function downloadExport(data: string, filename?: string): void {
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download =
        filename || `bakku-export-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Export and download application data
 */
export function exportAndDownload(options: ExportOptions = {}): void {
    try {
        const data = exportData(options);
        downloadExport(data);
    } catch (error) {
        console.error("Failed to export data:", error);
        throw new Error("Failed to export data. Please try again.");
    }
}

/**
 * Import data from JSON string
 */
export function importData(
    jsonString: string,
    options: {
        overwriteEnvironments?: boolean;
        overwriteHistory?: boolean;
    } = {}
): ImportResult {
    try {
        // Parse JSON
        const data = JSON.parse(jsonString);

        // Validate data
        const validation = validateImportData(data);
        if (!validation.isValid) {
            return {
                success: false,
                message: `Invalid import data: ${validation.errors.join(", ")}`,
                imported: {
                    environments: 0,
                    historyItems: 0,
                },
            };
        }

        const importData = data as ExportData;
        let importedEnvironments = 0;
        let importedHistoryItems = 0;

        // Import environments
        if (importData.environments && options.overwriteEnvironments !== false) {
            try {
                // Generate new IDs to avoid conflicts
                const envsWithNewIds = importData.environments.map((env) => ({
                    ...env,
                    id: `env-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                }));

                localStorage.setItem(
                    "bakku_environments",
                    JSON.stringify(envsWithNewIds)
                );
                importedEnvironments = envsWithNewIds.length;
            } catch (error) {
                console.error("Failed to import environments:", error);
            }
        }

        // Import history
        if (importData.history && options.overwriteHistory !== false) {
            try {
                // Generate new IDs to avoid conflicts
                const historyWithNewIds = importData.history.map((item) => ({
                    ...item,
                    id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                }));

                localStorage.setItem(
                    "bakku_request_history",
                    JSON.stringify(historyWithNewIds)
                );
                importedHistoryItems = historyWithNewIds.length;
            } catch (error) {
                console.error("Failed to import history:", error);
            }
        }

        return {
            success: true,
            message: `Imported ${importedEnvironments} environments and ${importedHistoryItems} history items`,
            imported: {
                environments: importedEnvironments,
                historyItems: importedHistoryItems,
            },
        };
    } catch (error) {
        return {
            success: false,
            message: `Failed to parse import data: ${error instanceof Error ? error.message : "Unknown error"}`,
            imported: {
                environments: 0,
                historyItems: 0,
            },
        };
    }
}

/**
 * Read and import data from a file
 */
export function importFromFile(
    file: File,
    options?: {
        overwriteEnvironments?: boolean;
        overwriteHistory?: boolean;
    }
): Promise<ImportResult> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const jsonString = event.target?.result as string;
                const result = importData(jsonString, options);
                resolve(result);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => {
            reject(new Error("Failed to read file"));
        };

        reader.readAsText(file);
    });
}

/**
 * Trigger file picker for import
 */
export function triggerFileImport(
    onImport: (result: ImportResult) => void,
    options?: {
        overwriteEnvironments?: boolean;
        overwriteHistory?: boolean;
    }
): void {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            try {
                const result = await importFromFile(file, options);
                onImport(result);
            } catch (error) {
                onImport({
                    success: false,
                    message: `Failed to import file: ${error instanceof Error ? error.message : "Unknown error"}`,
                    imported: {
                        environments: 0,
                        historyItems: 0,
                    },
                });
            }
        }
    };

    input.click();
}

/**
 * Export environments only
 */
export function exportEnvironments(): void {
    exportAndDownload({ includeEnvironments: true, includeHistory: false });
}

/**
 * Export history only
 */
export function exportHistory(): void {
    exportAndDownload({ includeEnvironments: false, includeHistory: true });
}

/**
 * Export everything
 */
export function exportAll(): void {
    exportAndDownload({ includeEnvironments: true, includeHistory: true });
}

/**
 * Clear all data from localStorage
 */
export function clearAllData(): void {
    localStorage.removeItem("bakku_environments");
    localStorage.removeItem("bakku_request_history");
    localStorage.removeItem("bakku_active_env_id");
    localStorage.removeItem("bakku_panel_widths");
}
