import { Handle, Position } from "@xyflow/react";
import React, { FC } from "react";
import { DefaultNode } from "./DefaultNode";

interface FinishNodeProps {
  title: string;
  children: React.ReactNode;
}

export const FinishNode: FC<FinishNodeProps> = ({ title, children }) => {
  return (
    <DefaultNode title={title} className="min-w-80">
      {children}
      <Handle type="target" position={Position.Left} />
    </DefaultNode>
  );
};
