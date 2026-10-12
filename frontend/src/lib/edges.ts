import { Edge } from "@xyflow/react";

export const defaultEdges: Edge[] = [
  { id: "n1-n2", source: "n1", sourceHandle: "toCoder", target: "n2" },
  {
    id: "n1-n5",
    source: "n1",
    sourceHandle: "toErrorProcessing",
    target: "n5",
    targetHandle: "originalData",
    type: "SmoothFastXStep",
  },
  { id: "n2-n3", source: "n2", target: "n3" },
  { id: "n3-n4", source: "n3", target: "n4" },
  {
    id: "n4-n5-data",
    source: "n4",
    sourceHandle: "data",
    target: "n5",
    targetHandle: "decodedData",
  },
  {
    id: "n4-n5-error",
    source: "n4",
    sourceHandle: "isError",
    target: "n5",
    // style: {stroke: "#450a0a"},
    // style: { stroke: "red" },
    // markerEnd: {
    //   type: MarkerType.ArrowClosed,
    //   color: "red",
    //   height: 30,
    //   width: 30,
    // },
    targetHandle: "isError",
  },
  {
    id: "n5-n6",
    source: "n5",
    sourceHandle: "DetectedErrorsCount",
    target: "n6",
  },
  {
    id: "n5-n7",
    source: "n5",
    // style: { stroke: "red" },
    // markerEnd: {
    //   type: MarkerType.ArrowClosed,
    //   color: "red",
    //   height: 30,
    //   width: 30,
    // },
    sourceHandle: "UndetectedErrorsCount",
    target: "n7",
  },
  {
    id: "n5-n8",
    source: "n5",
    sourceHandle: "TotalPackets",
    target: "n8",
  },
];
