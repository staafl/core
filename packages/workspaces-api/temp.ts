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
    icon?: boolean;
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
     * @param icon - the icon which will be used as a workspace icon
     */
    pin(icon?: string): Promise<void>;
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