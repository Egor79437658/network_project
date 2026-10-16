import { useErrorProcessingStore } from "@/stores/errorProcessingStore";
import { FC } from "react";
import { FinishNode } from "./FinishNode";
import { Node, NodeProps } from "@xyflow/react";

type DetectedErrorsNodeProps = Node<{}, "DetectedErrorsNode">;

export const DetectedErrorsNode: FC<NodeProps<DetectedErrorsNodeProps>> = () => {
  const { detectedErrors } = useErrorProcessingStore();
  return (
    <FinishNode title="Количество обнаруженных ошибок">
      {detectedErrors}
    </FinishNode>
  );
};
