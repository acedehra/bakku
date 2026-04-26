import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import RequestItem from "../RequestItem";
import { SavedRequest } from "../../../types";

afterEach(() => {
  cleanup();
});

describe("RequestItem", () => {
  const mockRequest: SavedRequest = {
    id: "req-1",
    name: "Test Request",
    method: "GET",
    url: "https://example.com",
    headers: [],
    body: "",
    auth: { type: "None" },
    folderId: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const defaultProps = {
    request: mockRequest,
    selected: false,
    onSelect: vi.fn(),
    renaming: false,
    renameValue: "",
    setRenameValue: vi.fn(),
    onSaveRename: vi.fn(),
    onBlurRename: vi.fn(),
    onStartRename: vi.fn(),
    onDelete: vi.fn(),
    getMethodColor: (_method: string) => "text-green-500",
    truncateName: (name: string) => name,
  };

  it("renders request name and method correctly", () => {
    render(<RequestItem {...defaultProps} />);
    expect(screen.getByText("Test Request")).toBeInTheDocument();
    expect(screen.getByText("GET")).toBeInTheDocument();
  });

  it("applies selected styling when selected", () => {
    const { container } = render(
      <RequestItem {...defaultProps} selected={true} />
    );
    const item = container.querySelector('[class*="bg-accent"]');
    expect(item).toBeInTheDocument();
  });

  it("calls onSelect when clicked", () => {
    render(<RequestItem {...defaultProps} />);
    const item = screen.getByText("Test Request");
    fireEvent.click(item);

    expect(defaultProps.onSelect).toHaveBeenCalledWith(mockRequest);
  });

  it("shows context menu on right-click", () => {
    render(<RequestItem {...defaultProps} />);
    const item = screen.getByText("Test Request");
    fireEvent.contextMenu(item);

    expect(screen.getByText("Rename")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("calls onStartRename when Rename is clicked in context menu", () => {
    render(<RequestItem {...defaultProps} />);
    const item = screen.getByText("Test Request");
    fireEvent.contextMenu(item);

    const renameItem = screen.getByText("Rename");
    fireEvent.click(renameItem);

    expect(defaultProps.onStartRename).toHaveBeenCalledWith(
      mockRequest,
      expect.any(Object)
    );
  });

  it("calls onDelete when Delete is clicked in context menu", () => {
    render(<RequestItem {...defaultProps} />);
    const item = screen.getByText("Test Request");
    fireEvent.contextMenu(item);

    const deleteItem = screen.getByText("Delete");
    fireEvent.click(deleteItem);

    expect(defaultProps.onDelete).toHaveBeenCalledWith("req-1", expect.any(Object));
  });

  it("does not show context menu when renaming", () => {
    render(<RequestItem {...defaultProps} renaming={true} />);
    // When renaming, the text is shown in an input, not as text
    const input = screen.getByDisplayValue("");
    const item = input.closest("div");

    fireEvent.contextMenu(item!);

    expect(screen.queryByText("Rename")).not.toBeInTheDocument();
    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
  });

  it("shows rename input when renaming", () => {
    render(
      <RequestItem
        {...defaultProps}
        renaming={true}
        renameValue="Renamed Request"
      />
    );

    const input = screen.getByDisplayValue("Renamed Request");
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe("INPUT");
  });

  it("calls setRenameValue when input value changes", () => {
    render(
      <RequestItem
        {...defaultProps}
        renaming={true}
        renameValue="Renamed Request"
      />
    );

    const input = screen.getByDisplayValue("Renamed Request");
    fireEvent.change(input, { target: { value: "New Name" } });

    expect(defaultProps.setRenameValue).toHaveBeenCalledWith("New Name");
  });

  it("calls onSaveRename when Enter key is pressed", () => {
    render(
      <RequestItem
        {...defaultProps}
        renaming={true}
        renameValue="Renamed Request"
      />
    );

    const input = screen.getByDisplayValue("Renamed Request");
    fireEvent.keyDown(input, { key: "Enter" });

    expect(defaultProps.onSaveRename).toHaveBeenCalled();
  });

  it("calls onSaveRename when Escape key is pressed", () => {
    render(
      <RequestItem
        {...defaultProps}
        renaming={true}
        renameValue="Renamed Request"
      />
    );

    const input = screen.getByDisplayValue("Renamed Request");
    fireEvent.keyDown(input, { key: "Escape" });

    expect(defaultProps.onSaveRename).toHaveBeenCalled();
  });

  it("calls onBlurRename when input loses focus", () => {
    render(
      <RequestItem
        {...defaultProps}
        renaming={true}
        renameValue="Renamed Request"
      />
    );

    const input = screen.getByDisplayValue("Renamed Request");
    fireEvent.blur(input);

    expect(defaultProps.onBlurRename).toHaveBeenCalled();
  });

  it("stops event propagation when input is clicked", () => {
    render(
      <RequestItem
        {...defaultProps}
        renaming={true}
        renameValue="Renamed Request"
      />
    );

    const input = screen.getByDisplayValue("Renamed Request");
    const clickEvent = new MouseEvent("click", { bubbles: true });
    const stopPropagationSpy = vi.spyOn(clickEvent, "stopPropagation");

    fireEvent(input, clickEvent);

    expect(stopPropagationSpy).toHaveBeenCalled();
  });

  it("truncates long request names", () => {
    const longNameRequest = {
      ...mockRequest,
      name: "This is a very long request name that should be truncated",
    };
    render(
      <RequestItem
        {...defaultProps}
        request={longNameRequest}
        truncateName={(name) => name.substring(0, 20) + "..."}
      />
    );

    expect(screen.getByText(/This is a very long/)).toBeInTheDocument();
  });

  it("applies correct method color", () => {
    const getMethodColor = vi.fn(() => "text-green-500");
    render(<RequestItem {...defaultProps} getMethodColor={getMethodColor} />);

    expect(getMethodColor).toHaveBeenCalledWith("GET");
  });

  it("renders different HTTP methods correctly", () => {
    const methods = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD"] as const;

    methods.forEach((method) => {
      const { unmount } = render(
        <RequestItem
          {...defaultProps}
          request={{ ...mockRequest, method }}
        />
      );

      expect(screen.getByText(method)).toBeInTheDocument();
      unmount();
    });
  });
});
