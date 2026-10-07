import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import { FC } from "react";
import { DefaultNode } from "./DefaultNode";

type CoderNodeProps = Node<{}, "CoderNode">;

export const CoderNode: FC<NodeProps<CoderNodeProps>> = () => {
  return (
    <DefaultNode title="Генератор проверочных символов" className="max-w-40">
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </DefaultNode>
  );
};
