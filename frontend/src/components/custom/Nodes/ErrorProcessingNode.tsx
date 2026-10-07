import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import { FC } from "react";
import { DefaultNode } from "./DefaultNode";

type ErrorProcessingNodeProps = Node<{}, "ErrorProcessingNode">;

export const ErrorProcessingNode: FC<
  NodeProps<ErrorProcessingNodeProps>
> = () => {
  return (
    <DefaultNode title="Обработчик результатов" className="min-w-85 min-h-60">
      <Handle
        type="target"
        position={Position.Left}
        id="originalData"
        style={{ top: 15 }}
      />
      <Handle type="target" position={Position.Left} id="decodedData" />
      <Handle
        type="target"
        position={Position.Left}
        id="isError"
        style={{ bottom: 15, top: "auto" }}
      />

      <Handle
        type="source"
        position={Position.Right}
        id="DetectedErrorsCount"
        style={{ top: 15 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="UndetectedErrorsCount"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="TotalPackets"
        style={{ bottom: 15, top: "auto" }}
      />
    </DefaultNode>
  );
};
