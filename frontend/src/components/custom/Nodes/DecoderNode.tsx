import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import { FC } from "react";
import { DefaultNode } from "./DefaultNode";

type DecoderNodeProps = Node<{}, "DecoderNode">;

export const DecoderNode: FC<NodeProps<DecoderNodeProps>> = () => {
  return (
    <DefaultNode title="Декодер" className="min-h-35 min-w-40">
      <div className="absolute bottom-4 right-5 font-bold">Err</div>
      <Handle type="target" position={Position.Left} />
      <Handle
        type="source"
        position={Position.Right}
        id="data"
        style={{ top: 21 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="isError"
        style={{ bottom: 14, top: "auto" }}
      />
    </DefaultNode>
  );
};
