import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import React, { FC } from "react";
import { DefaultNode } from "./DefaultNode";

type FinishNodeProps = Node<
  {
    title: string;
    children: React.ReactNode;
  },
  "FinishNode"
>;

export const FinishNode: FC<NodeProps<FinishNodeProps>> = ({ data }) => {
  const { title, children } = data;
  return (
    <DefaultNode title={title}>
      {children}
      <Handle type="target" position={Position.Left} />
    </DefaultNode>
  );
};
