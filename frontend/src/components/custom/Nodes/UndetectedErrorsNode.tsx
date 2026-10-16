import { useErrorProcessingStore } from "@/stores/errorProcessingStore";
import { FC } from "react";
import { FinishNode } from "./FinishNode";
import { Node, NodeProps } from "@xyflow/react";
import NumberFlow from '@number-flow/react'

type UnetectedErrorsNodeProps = Node<{}, "UnetectedErrorsNode">;

export const UnetectedErrorsNode: FC<NodeProps<UnetectedErrorsNodeProps>> = () => {
  const { undetectedErrors } = useErrorProcessingStore();
  return (
    <FinishNode title="Количество пропущенных ошибок">
      <NumberFlow value={undetectedErrors} className="text-lg p-0 text-center" />
    </FinishNode>
  );
};
