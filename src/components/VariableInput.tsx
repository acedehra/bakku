import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Environment } from "../types";

interface VariableInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    type?: "text" | "textarea" | "password";
    environment?: Environment | null;
    rows?: number;
    onClick?: () => void;
}

export const VariableInput = forwardRef<HTMLInputElement | HTMLTextAreaElement, VariableInputProps>(
    ({
        value,
        onChange,
        placeholder,
        className = "",
        type = "text",
        environment,
        rows = 3,
        onClick,
    }, ref) => {
        const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
        const highlightRef = useRef<HTMLDivElement>(null);

        useImperativeHandle(ref, () => inputRef.current as any);

        const syncScroll = () => {
            if (inputRef.current && highlightRef.current) {
                highlightRef.current.scrollTop = inputRef.current.scrollTop;
                highlightRef.current.scrollLeft = inputRef.current.scrollLeft;
            }
        };

        useEffect(() => {
            syncScroll();
        }, [value]);

        const renderHighlightedText = () => {
            if (type === "password") return value.split("").map(() => "•").join("");
            if (!value) return null;

            const parts = value.split(/(\{\{[^{}]*\}\})/g);

            return parts.map((part, i) => {
                if (part.startsWith("{{") && part.endsWith("}}")) {
                    const varName = part.slice(2, -2);
                    const isValid = environment?.variables.some(
                        (v) => v.key === varName && v.enabled
                    );

                    // To maintain pixel-perfect alignment in monospace, we render a pill
                    // that is exactly `part.length` characters wide.
                    // Raw: {{var}} (length 7) -> Pill: [ var ] (length 7)
                    return (
                        <span
                            key={i}
                            style={{
                                width: `${part.length}ch`,
                                display: 'inline-flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                            className={`rounded transition-all transform hover:scale-[1.02] ${isValid
                                ? "bg-primary text-primary-foreground font-black shadow-sm"
                                : "bg-destructive/10 text-destructive border border-destructive/30 italic opacity-70"
                                }`}
                        >
                            {varName}
                        </span>
                    );
                }
                return <span key={i}>{part}</span>;
            });
        };

        const fontStack = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";
        // Unified styles to ensure pixel-perfect alignment
        const commonClasses = "w-full text-base leading-normal font-mono";
        const layoutClasses = type === "textarea"
            ? "p-4 min-h-[200px] whitespace-pre-wrap break-all"
            : "px-4 h-12 flex items-center whitespace-nowrap overflow-hidden";

        const sharedStyles: React.CSSProperties = {
            fontFamily: fontStack,
            lineHeight: "24px",
            fontSize: "14px",
            letterSpacing: "0px",
        };

        return (
            <div className={`relative group ${className}`}>
                {/* Highlight Layer */}
                <div
                    ref={highlightRef}
                    className={`absolute inset-0 pointer-events-none border border-transparent ${commonClasses} ${layoutClasses} text-foreground/90`}
                    style={sharedStyles}
                    aria-hidden="true"
                >
                    {renderHighlightedText()}
                </div>

                {/* Input Layer */}
                {type === "textarea" ? (
                    <textarea
                        ref={inputRef as any}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onScroll={syncScroll}
                        onClick={onClick}
                        placeholder={placeholder}
                        rows={rows}
                        style={{ ...sharedStyles, color: 'transparent', WebkitTextFillColor: 'transparent' }}
                        className={`block w-full rounded-md border border-input bg-transparent ${commonClasses} ${layoutClasses} caret-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all selection:bg-primary/20`}
                    />
                ) : (
                    <input
                        ref={inputRef as any}
                        type={type === "password" ? "password" : "text"}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onScroll={syncScroll}
                        onClick={onClick}
                        placeholder={placeholder}
                        style={{ ...sharedStyles, color: 'transparent', WebkitTextFillColor: 'transparent' }}
                        className={`block w-full rounded-md border border-input bg-transparent ${commonClasses} ${layoutClasses} caret-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all selection:bg-primary/20`}
                    />
                )}
            </div>
        );
    }
);
