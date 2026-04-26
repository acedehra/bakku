import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import FolderItem from "../FolderItem";
import { RequestFolder, SavedRequest } from "../../../types";

describe("FolderItem", () => {
  const mockFolder: RequestFolder = {
    id: "folder-1",
    name: "Test Folder",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const mockRequest: SavedRequest = {
    id: "req-1",
    name: "Test Request",
    method: "GET",
    url: "https://example.com",
    headers: [],
    body: "",
    auth: { type: "None" },
    folderId: "folder-1",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const defaultProps = {
    folder: mockFolder,
    isExpanded: false,
    onToggle: vi.fn(),
    onRequestSelect: vi.fn(),
    requests: [mockRequest],
    selectedRequestId: null,
    renamingFolderId: null,
    renamingRequestId: null,
    renameValue: "",
    setRenameValue: vi.fn(),
    onSaveRename: vi.fn(),
    onBlurRename: vi.fn(),
    onStartRenameFolder: vi.fn(),
    onStartRenameRequest: vi.fn(),
    onDeleteFolder: vi.fn(),
    onDeleteRequest: vi.fn(),
    getMethodColor: (method: string) => "text-green-500",
    truncateName: (name: string) => name,
  };

  it("renders folder name correctly", () => {
    render(<FolderItem {...defaultProps} />);
    expect(screen.getByText("Test Folder")).toBeInTheDocument();
  });

  it("renders chevron right when collapsed", () => {
    render(<FolderItem {...defaultProps} isExpanded={false} />);
    const chevron = document.querySelector("svg");
    expect(chevron).toBeInTheDocument();
  });

  it("renders chevron down when expanded", () => {
    render(<FolderItem {...defaultProps} isExpanded={true} />);
    // Should show requests when expanded
    expect(screen.getByText("Test Request")).toBeInTheDocument();
  });

  it("calls onToggle when folder header is clicked", () => {
    render(<FolderItem {...defaultProps} />);
    const header = screen.getByText("Test Folder").closest("div");
    fireEvent.click(header!);
    expect(defaultProps.onToggle).toHaveBeenCalledWith("folder-1");
  });

  it("does not show requests when collapsed", () => {
    render(<FolderItem {...defaultProps} isExpanded={false} />);
    expect(screen.queryByText("Test Request")).not.toBeInTheDocument();
  });

  it("shows requests when expanded", () => {
    render(<FolderItem {...defaultProps} isExpanded={true} />);
    expect(screen.getByText("Test Request")).toBeInTheDocument();
  });

  it("shows context menu on right-click", () => {
    render(<FolderItem {...defaultProps} />);
    const header = screen.getByText("Test Folder").closest("div");
    fireEvent.contextMenu(header!);

    expect(screen.getByText("Rename")).toBeInTheDocument();
    expect(screen.getByText("Add Request")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("calls onStartRenameFolder when Rename is clicked in context menu", () => {
    render(<FolderItem {...defaultProps} />);
    const header = screen.getByText("Test Folder").closest("div");
    fireEvent.contextMenu(header!);

    const renameItem = screen.getByText("Rename");
    fireEvent.click(renameItem);

    expect(defaultProps.onStartRenameFolder).toHaveBeenCalledWith(
      mockFolder,
      expect.any(Object)
    );
  });

  it("calls onAddRequestToFolder when Add Request is clicked in context menu", () => {
    const onAddRequestToFolder = vi.fn();
    render(<FolderItem {...defaultProps} onAddRequestToFolder={onAddRequestToFolder} />);
    const header = screen.getByText("Test Folder").closest("div");
    fireEvent.contextMenu(header!);

    const addRequestItem = screen.getByText("Add Request");
    fireEvent.click(addRequestItem);

    expect(onAddRequestToFolder).toHaveBeenCalledWith("folder-1");
  });

  it("calls onDeleteFolder when Delete is clicked in context menu", () => {
    render(<FolderItem {...defaultProps} />);
    const header = screen.getByText("Test Folder").closest("div");
    fireEvent.contextMenu(header!);

    const deleteItem = screen.getByText("Delete");
    fireEvent.click(deleteItem);

    expect(defaultProps.onDeleteFolder).toHaveBeenCalledWith(
      "folder-1",
      expect.any(Object)
    );
  });

  it("does not show context menu when renaming", () => {
    render(<FolderItem {...defaultProps} renamingFolderId="folder-1" />);
    // When renaming, the text is shown in an input, not as text
    const input = screen.getByDisplayValue("");
    const header = input.closest("div");

    fireEvent.contextMenu(header!);

    expect(screen.queryByText("Rename")).not.toBeInTheDocument();
    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
  });

  it("shows rename input when renaming", () => {
    render(
      <FolderItem
        {...defaultProps}
        renamingFolderId="folder-1"
        renameValue="Renamed Folder"
      />
    );

    const input = screen.getByDisplayValue("Renamed Folder");
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe("INPUT");
  });

  it("calls setRenameValue when input value changes", () => {
    render(
      <FolderItem
        {...defaultProps}
        renamingFolderId="folder-1"
        renameValue="Renamed Folder"
      />
    );

    const input = screen.getByDisplayValue("Renamed Folder");
    fireEvent.change(input, { target: { value: "New Name" } });

    expect(defaultProps.setRenameValue).toHaveBeenCalledWith("New Name");
  });

  it("calls onSaveRename when Enter key is pressed", () => {
    render(
      <FolderItem
        {...defaultProps}
        renamingFolderId="folder-1"
        renameValue="Renamed Folder"
      />
    );

    const input = screen.getByDisplayValue("Renamed Folder");
    fireEvent.keyDown(input, { key: "Enter" });

    expect(defaultProps.onSaveRename).toHaveBeenCalled();
  });

  it("calls onSaveRename when Escape key is pressed", () => {
    render(
      <FolderItem
        {...defaultProps}
        renamingFolderId="folder-1"
        renameValue="Renamed Folder"
      />
    );

    const input = screen.getByDisplayValue("Renamed Folder");
    fireEvent.keyDown(input, { key: "Escape" });

    expect(defaultProps.onSaveRename).toHaveBeenCalled();
  });

  it("calls onBlurRename when input loses focus", () => {
    render(
      <FolderItem
        {...defaultProps}
        renamingFolderId="folder-1"
        renameValue="Renamed Folder"
      />
    );

    const input = screen.getByDisplayValue("Renamed Folder");
    fireEvent.blur(input);

    expect(defaultProps.onBlurRename).toHaveBeenCalled();
  });

  it("shows empty message when folder has no requests", () => {
    render(<FolderItem {...defaultProps} requests={[]} isExpanded={true} />);
    expect(screen.getByText("No requests in this folder")).toBeInTheDocument();
  });

  it("truncates long folder names", () => {
    const longNameFolder = {
      ...mockFolder,
      name: "This is a very long folder name that should be truncated",
    };
    render(
      <FolderItem
        {...defaultProps}
        folder={longNameFolder}
        truncateName={(name) => name.substring(0, 20) + "..."}
      />
    );

    expect(screen.getByText(/This is a very long/)).toBeInTheDocument();
  });
});
