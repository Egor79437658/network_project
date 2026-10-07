import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import { FC } from "react";
import { DefaultNode } from "./DefaultNode";

type DataSourceNodeProps = Node<{}, "DataSourceNode">;

export const DataSourceNode: FC<NodeProps<DataSourceNodeProps>> = () => {
  return (
    <DefaultNode title="Источник данных">
      <Handle
        type="source"
        position={Position.Right}
        id="toErrorProcessing"
        style={{ top: 15 }}
      />
      <Handle type="source" position={Position.Right} id="toCoder" />
    </DefaultNode>
  );
};
