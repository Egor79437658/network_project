import { useTheme } from "@/components/theme-provider";
import { defaultEdges } from "@/lib/edges";
import { startSimulation } from "@/lib/launchSimulation";
import { defaultNodes } from "@/lib/nodes";
import { useCoderStore } from "@/stores/coderStore";
import { useErrorProcessingStore } from "@/stores/errorProcessingStore";
import { useNetworkLineStore } from "@/stores/networkLineStore";
import { SmoothFastXStep } from "@customComponents/Edges/SmoothFastXStep";
import {
  CoderNode,
  DataSourceNode,
  DecoderNode,
  ErrorProcessingNode,
  FinishNode,
  NetworkLineNode,
} from "@customComponents/Nodes";
import { Button } from "@shadcnComponents/button";
import { Events, WML } from "@wailsio/runtime";
import {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  DefaultEdgeOptions,
  Edge,
  EdgeChange,
  EdgeTypes,
  MarkerType,
  Node,
  NodeChange,
  NodeTypes,
  Panel,
  ReactFlow,
} from "@xyflow/react";
import { FC, useCallback, useEffect, useState } from "react";

const nodeTypes: NodeTypes = {
  DataSourceNode: DataSourceNode,
  CoderNode: CoderNode,
  NetworkLineNode: NetworkLineNode,
  DecoderNode: DecoderNode,
  ErrorProcessingNode: ErrorProcessingNode,
  FinishNode: FinishNode,
};

const edgeTypes: EdgeTypes = {
  SmoothFastXStep: SmoothFastXStep,
};

const defaultedgeOptions: DefaultEdgeOptions = {
  type: "smoothstep",
  deletable: false,
  selectable: false,
  style: { stroke: "white" },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 25,
    height: 25,
  },
};

export const MainPage: FC = () => {
  const { theme } = useTheme();
  const [nodes, setNodes] = useState(defaultNodes);
  const [edges, setEdges] = useState(defaultEdges);
  const coderState = useCoderStore();
  const networkState = useNetworkLineStore();
  const errorProcessingState = useErrorProcessingStore();

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

  useEffect(() => {
    const off1 = Events.On("simulation:started", () =>
      setEdges((eds) => eds.map((e) => ({ ...e, animated: true }))),
    );
    const off2 = Events.On("simulation:finished", () =>
      setEdges((eds) => eds.map((e) => ({ ...e, animated: false }))),
    );
    WML.Reload();
    return () => {
      off1();
      off2();
    };
  }, []);

  const onLaunch = () => {
    startSimulation({
      coder: {
        dataLength: coderState.dataLength,
        polinomial: coderState.polinomial,
        polinomialMode: coderState.polinomialMode,
      },
      networkLine: {
        mode: networkState.mode,
        independedPropability: networkState.independedPropability,
        propabilityInGoodCondition: networkState.propabilityInGoodCondition,
        propabilityInBadCondition: networkState.propabilityInBadCondition,
        propabilityToGoBad: networkState.propabilityToGoBad,
        propabilityToGoGood: networkState.propabilityToGoGood,
      },
      errorProcessing: {
        totalPacketsToStop: errorProcessingState.totalPacketsToStop,
        totalUndetectedErrorsToStop:
          errorProcessingState.totalUndetectedErrorsToStop,
      },
    });
  };

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
        <Panel position="top-center" className="mt-6">
          <Button onClick={onLaunch} className="text-lg px-6 py-5">
            Запустить
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
};
