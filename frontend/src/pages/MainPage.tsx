import { useTheme } from "@/components/theme-provider";
import { defaultEdges } from "@/lib/edges";
import { defaultNodes } from "@/lib/nodes";
import { SmoothFastXStep } from "@customComponents/Edges/SmoothFastXStep";
import {
  CoderNode,
  DataSourceNode,
  DecoderNode,
  ErrorProcessingNode,
  FinishNode,
  NetworkLineNode,
} from "@customComponents/Nodes";
import {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  DefaultEdgeOptions,
  Edge,
  EdgeChange,
  EdgeTypes,
  Node,
  NodeChange,
  NodeTypes,
  ReactFlow,
} from "@xyflow/react";
import { FC, useCallback, useState } from "react";

const nodeTypes: NodeTypes = {
  DataSourceNode: DataSourceNode,
  CoderNode: CoderNode,
  NetworkLineNode: NetworkLineNode,
  DecoderNode: DecoderNode,
  ErrorProcessingNode: ErrorProcessingNode,
  FinishNode: FinishNode,
};

const edgeTypes: EdgeTypes = {
  SmoothFastXStep: SmoothFastXStep
}

const defaultedgeOptions: DefaultEdgeOptions = {
  type: "smoothstep",
  deletable: false,
  selectable: false,
}

export const MainPage: FC = () => {
  const { theme } = useTheme();
  const [nodes, setNodes] = useState(defaultNodes);
  const [edges, setEdges] = useState(defaultEdges);

  const onNodesChange = useCallback(
    (changes: NodeChange<Node>[]) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        colorMode={theme}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodes={nodes}
        edges={edges}
        defaultEdgeOptions={defaultedgeOptions}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};
