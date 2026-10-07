import { Node } from "@xyflow/react";

const middleY = Math.max((window.innerHeight - 24) / 2, 0);
const gap = 50;
const sourceX = 50;
const coderX = sourceX + 200 + gap;
const networlLineX = coderX + 200 + gap;
const decoderX = networlLineX + 480 + gap;
const errorProcessingX = decoderX + 200 + gap;
const finishX = errorProcessingX + 400 + gap;
const finishY = middleY - 53;
const finishGap = 150;

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
    position: { x: coderX, y: middleY - 21.5 },
    type: "CoderNode",
  },
  {
    id: "n3",
    data: {},
    position: { x: networlLineX, y: middleY },
    type: "NetworkLineNode",
  },
  {
    id: "n4",
    data: {},
    position: { x: decoderX, y: middleY - 21.5 },
    type: "DecoderNode",
  },
  {
    id: "n5",
    data: {},
    position: { x: errorProcessingX, y: middleY - 110 },
    type: "ErrorProcessingNode",
  },
  {
    id: "n6",
    data: { title: "Количество обнаруженных ошибок", children: 0 },
    position: { x: finishX, y: finishY -finishGap },
    type: "FinishNode",
  },
  {
    id: "n7",
    data: { title: "Количество пропущенных ошибок", children: 0 },
    position: { x: finishX, y: finishY },
    type: "FinishNode",
  },
  {
    id: "n8",
    data: { title: "Количество переданных пакетов", children: 0 },
    position: { x: finishX, y: finishY + finishGap },
    type: "FinishNode",
  },
];
