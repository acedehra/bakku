import { memo } from "react";
import { AppContextValue } from "../../contexts/AppContext";
import { SavedRequestsSidebar } from "../SavedRequestsSidebar";
import { RequestPane } from "../RequestPane";
import { ResponsePane } from "../ResponsePane";
import { ResizeHandle } from "../ResizeHandle";
import { EnvironmentManager } from "../EnvironmentManager";
import { FolderNameDialog } from "../saved-requests/FolderNameDialog";

interface AppLayoutProps extends AppContextValue {}

function AppLayout(props: AppLayoutProps) {
  const {
    savedRequests,
    folders,
    selectedSavedRequestId,
    expandedFolders,
    searchQuery,
    handleSavedRequestSelect,
    handleCreateRequest,
    handleCreateFolder,
    handleDeleteRequest,
    handleDeleteFolder,
    handleToggleFolder,
    setSearchQuery,
    handleRenameFolder,
    handleRenameRequest,
    handleCreateRequestInFolder,
    handleMoveRequestToFolder,
    method,
    url,
    headers,
    paramEntries,
    body,
    auth,
    setMethod,
    setUrl,
    setHeaders,
    setParamEntries,
    setBody,
    setAuth,
    executeRequest,
    loading,
    environments,
    activeEnvId,
    setActiveEnvId,
    handleOpenEnvManager,
    handleCloseEnvManager,
    handleAddEnvironment,
    handleUpdateEnvironment,
    handleDeleteEnvironment,
    response,
    error,
    sidebarWidth,
    responseWidth,
    handleSidebarResize,
    handleResponseResize,
    isEnvManagerOpen,
    folderDialogOpen,
    handleConfirmFolderName,
    handleCancelFolderName,
  } = props;

  return (
    <div className="h-screen bg-background text-foreground flex overflow-hidden">
      <div style={{ width: `${sidebarWidth}px` }} className="h-screen flex-shrink-0">
        <SavedRequestsSidebar
          savedRequests={savedRequests}
          folders={folders}
          selectedRequestId={selectedSavedRequestId}
          expandedFolders={expandedFolders}
          searchQuery={searchQuery}
          onSelectRequest={handleSavedRequestSelect}
          onCreateRequest={handleCreateRequest}
          onCreateFolder={handleCreateFolder}
          onDeleteRequest={handleDeleteRequest}
          onDeleteFolder={handleDeleteFolder}
          onToggleFolder={handleToggleFolder}
          onSearchChange={setSearchQuery}
          onRenameFolder={handleRenameFolder}
          onRenameRequest={handleRenameRequest}
          onCreateRequestInFolder={handleCreateRequestInFolder}
          onMoveRequestToFolder={handleMoveRequestToFolder}
        />
      </div>
      <ResizeHandle onResize={handleSidebarResize} />
      <RequestPane
        method={method}
        url={url}
        headers={headers}
        paramEntries={paramEntries}
        body={body}
        auth={auth}
        onMethodChange={setMethod}
        onUrlChange={setUrl}
        onHeadersChange={setHeaders}
        onParamEntriesChange={setParamEntries}
        onBodyChange={setBody}
        onAuthChange={setAuth}
        onSend={executeRequest}
        loading={loading}
        environments={environments}
        activeEnvId={activeEnvId}
        onActiveEnvChange={setActiveEnvId}
        onOpenEnvManager={handleOpenEnvManager}
      />
      <ResizeHandle onResize={handleResponseResize} />
      <div style={{ width: `${responseWidth}px` }} className="h-screen flex-shrink-0">
        <ResponsePane response={response} error={error} loading={loading} />
      </div>

      {isEnvManagerOpen && (
        <EnvironmentManager
          environments={environments}
          onAdd={handleAddEnvironment}
          onUpdate={handleUpdateEnvironment}
          onDelete={handleDeleteEnvironment}
          onClose={handleCloseEnvManager}
        />
      )}

      <FolderNameDialog
        open={folderDialogOpen}
        onClose={handleCancelFolderName}
        onConfirm={handleConfirmFolderName}
      />
    </div>
  );
}

export default memo(AppLayout);
