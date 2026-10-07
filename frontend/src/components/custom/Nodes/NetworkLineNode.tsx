import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import { FC } from "react";
import { DefaultNode } from "./DefaultNode";

type NetworkLineNodeProps = Node<{}, "NetworkLineNode">;

export const NetworkLineNode: FC<NodeProps<NetworkLineNodeProps>> = () => {
  return (
    <DefaultNode title="Линия передачи" className="min-w-120">
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </DefaultNode>
  );
};
