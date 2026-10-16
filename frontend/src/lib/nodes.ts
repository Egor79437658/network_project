import { Node } from "@xyflow/react";

const middleY = Math.max((window.innerHeight - 24) / 2, 0);
const gap = 60;
const sourceX = 0;
const coderX = sourceX + 180 + gap;
const networlLineX = coderX + 160 + gap;
const decoderX = networlLineX + 480 + gap;
const errorProcessingX = decoderX + 160 + gap;
const finishX = errorProcessingX + 520 + gap;
const finishY = middleY - 67;
const finishGap = 200;

export const defaultNodes: Node[] = [
  {
    id: "n1",
    data: {},
    position: { x: sourceX, y: middleY },
    type: "DataSourceNode",
  },
  {
    id: "n2",
    data: {},
    position: { x: coderX, y: middleY - 13 },
    type: "CoderNode",
  },
  {
    id: "n3",
    data: {},
    position: { x: networlLineX, y: middleY - 13 },
    type: "NetworkLineNode",
  },
  {
    id: "n4",
    data: {},
    position: { x: decoderX, y: middleY - 23 },
    type: "DecoderNode",
  },
  {
    id: "n5",
    data: {},
    position: { x: errorProcessingX, y: middleY - 122 },
    type: "ErrorProcessingNode",
  },
  {
    id: "n6",
    data: {},
    position: { x: finishX, y: finishY - finishGap },
    type: "DetectedErrorsNode",
  },
  {
    id: "n7",
    data: {},
    position: { x: finishX, y: finishY },
    type: "UnetectedErrorsNode",
  },
  {
    id: "n8",
    data: {},
    position: { x: finishX, y: finishY + finishGap },
    type: "TotalTransmittedNode",
  },
];
