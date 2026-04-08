import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ResponsePane } from "../ResponsePane";
import { ResponseData } from "../../types";

const mockResponse = (headers: Record<string, string>, body: string): ResponseData => ({
  status: 200,
  statusText: "OK",
  headers,
  body,
  timing: 150,
  size: 1024,
});

describe("ResponsePane Syntax Highlighting", () => {
  it("uses SyntaxHighlighter for application/json content type", () => {
    render(
      <ResponsePane 
        response={mockResponse({ "content-type": "application/json" }, '{"test": 123}')} 
        error={null} 
        loading={false} 
      />
    );
    
    // In our implementation, standard text uses a <pre> with 'whitespace-pre-wrap'.
    // The SyntaxHighlighter will not have this specific class structure we defined for the fallback.
    const normalPre = document.querySelector('.whitespace-pre-wrap');
    expect(normalPre).not.toBeInTheDocument();
    
    // SyntaxHighlighter renders its own code tags. We check that the text still rendered.
    expect(screen.getByText(/"test"/)).toBeInTheDocument();
  });

  it("uses standard pre for text/plain content type", () => {
    render(
      <ResponsePane 
        response={mockResponse({ "content-type": "text/plain" }, "Hello World")} 
        error={null} 
        loading={false} 
      />
    );
    
    const normalPre = document.querySelector('.whitespace-pre-wrap');
    expect(normalPre).toBeInTheDocument();
    expect(normalPre).toHaveTextContent("Hello World");
  });

  it("uses standard pre for missing content type", () => {
    render(
      <ResponsePane 
        response={mockResponse({}, "Hello World")} 
        error={null} 
        loading={false} 
      />
    );
    
    const normalPre = document.querySelector('.whitespace-pre-wrap');
    expect(normalPre).toBeInTheDocument();
    expect(normalPre).toHaveTextContent("Hello World");
  });
});
