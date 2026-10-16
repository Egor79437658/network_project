import { useErrorProcessingStore } from "@/stores/errorProcessingStore";
import { FC } from "react";
import { FinishNode } from "./FinishNode";
import { Node, NodeProps } from "@xyflow/react";
import NumberFlow from "@number-flow/react";


type DetectedErrorsNodeProps = Node<{}, "DetectedErrorsNode">;

export const DetectedErrorsNode: FC<
  NodeProps<DetectedErrorsNodeProps>
> = () => {
  const { detectedErrors } = useErrorProcessingStore();
  return (
    <FinishNode title="Количество обнаруженных ошибок">
      <NumberFlow value={detectedErrors} className="text-lg p-0 text-center" />
    </FinishNode>
  );
};
