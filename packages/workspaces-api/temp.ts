import { Glue42Workspaces } from "./workspaces";

export interface WorkspaceConfig extends Glue42Workspaces.WorkspaceConfig {
    /**
     * Controls whether the workspace will be opened in a pinned or in a normal state
     */
    isPinned?: boolean;
    /**
     * Sets the icon related for the workspace. The icon will be used for example for pinned workspaces.
     */
    icon?: boolean;
    /**
     * Controls whether the workspace will be focused or not in the frame when opened
     */
    isSelected?: boolean;
}

export interface RestoreWorkspaceConfig extends Glue42Workspaces.RestoreWorkspaceConfig {
    /**
     * Controls whether the workspace will be opened in a pinned or in a normal state
     */
    isPinned?: boolean;
    /**
     * Sets the icon related for the workspace. The icon will be used for example for pinned workspaces.
     */
    icon?: string;
    /**
     * Controls whether the workspace will be focused or not in the frame when opened
     */
    isSelected?: boolean;
}

export interface Workspace extends Glue42Workspaces.Workspace {
    /**
     * Indicates if the workspace is in a pinned state or not
     */
    isPinned?: boolean;
    /**
     * The icon related to the workspace in the same format as it was passed
     */
    icon?: string;
    /**
     * Changes the state of the workspace to pinned - moves the workspace tab to the index before all unpinned tabs, removes the save button, title, close button and shows the workspace icon
     * @param options - object which controls the pinning
     */
    pin(options?: WorkspacePinOptions): Promise<void>;
    /**
     * Changes the state of the workspace to normal -  moves the workspace tab to the index after all pinned tabs, returns the save button, title, close button and hides the workspace icon
     */
    unpin(): Promise<void>;

    /**
     * Returns the workspace icon
     */
    getIcon(): Promise<string>;

    /**
     * Changes the workspace icon to the specified one
     * @param icon 
     */
    setIcon(icon: string): Promise<void>;
}

export interface RestoreWorkspaceDefinition {
    /**
     * The name of a saved workspace layout, which will be restored.
     */
    name: string;
    /**
     * An optional object containing various workspace restore options.
     */
    restoreOptions?: RestoreWorkspaceConfig;
}

export interface EmptyFrameDefinition {
    /**
     * Optional frame related settings
     */
    frameConfig?: Glue42Workspaces.NewFrameConfig;
    /**
     * Optional context which will be passed to the initialization callback
     */
    context?: object;
}

export interface FrameInitializationConfig {
    /**
     * Array of workspace definitions with which the frame should be opened
     */
    workspaces: Array<Glue42Workspaces.WorkspaceDefinition | RestoreWorkspaceDefinition>;
}

export interface FrameInitializationContext {
    /**
     * Context passed when the frame was created
     */
    context?: object;
}

export interface FrameSummary extends Glue42Workspaces.FrameSummary {
    /** Indicates whether the frame has been initialized or not */
    isInitialized: boolean;
}

export interface API extends Glue42Workspaces.API {
    /**
     * 
     * @param definition Optional definition of the frame
     */
    createEmptyFrame(definition?: EmptyFrameDefinition): Promise<Glue42Workspaces.Frame>;
}

export interface WorkspacePinOptions {
    icon?: string;
}