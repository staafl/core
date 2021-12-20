import React, { useEffect } from "react";
import { MoveAreaProps } from "../types/internal";
import workspacesManager from "../workspacesManager";

const MoveArea: React.FC<MoveAreaProps> = ({ ...props }) => {
    useEffect(() => {
        workspacesManager.notifyMoveAreaChanged();

        return () => {
            workspacesManager.notifyMoveAreaChanged();
        };
    }, []);
    return <div {...props} id={"workspaces-move-area"} />
};

export default MoveArea;