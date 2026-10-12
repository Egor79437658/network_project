import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import { FC } from "react";
import { DefaultNode } from "./DefaultNode";

import { NodePopover } from "@customComponents/NodePopover";
import { NetworkLineForm } from "@customComponents/Forms/NetworkLineForm";

type NetworkLineNodeProps = Node<{}, "NetworkLineNode">;

export const NetworkLineNode: FC<NodeProps<NetworkLineNodeProps>> = () => {
  return (
    <DefaultNode title="Линия передачи" className="min-h-30 min-w-120">
      <NodePopover className="min-w-95">
        <NetworkLineForm />
      </NodePopover>

      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </DefaultNode>
  );
};
