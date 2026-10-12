import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import { FC } from "react";
import { DefaultNode } from "./DefaultNode";
import { CoderForm } from "@customComponents/Forms/CoderForm";
import { NodePopover } from "@customComponents/NodePopover";

type CoderNodeProps = Node<{}, "CoderNode">;

export const CoderNode: FC<NodeProps<CoderNodeProps>> = () => {
  return (
    <DefaultNode
      title="Кодер"
      className="min-h-30 min-w-40"
    >
      <NodePopover>
        <CoderForm />
      </NodePopover>

      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </DefaultNode>
  );
};
