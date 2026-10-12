import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import { FC } from "react";
import { DefaultNode } from "./DefaultNode";
import { CoderForm } from "@customComponents/Forms/CoderForm";
import { NodePopover } from "@customComponents/NodePopover";

type CoderNodeProps = Node<{}, "CoderNode">;

export const CoderNode: FC<NodeProps<CoderNodeProps>> = () => {
  return (
    <DefaultNode
      title="Генератор проверочных символов"
      className="min-h-42 max-w-40"
    >
      <NodePopover>
        <CoderForm />
      </NodePopover>

      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </DefaultNode>
  );
};
