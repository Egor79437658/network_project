import { useErrorProcessingStore } from "@/stores/errorProcessingStore";
import { FC } from "react";
import { FinishNode } from "./FinishNode";
import { Node, NodeProps } from "@xyflow/react";
import NumberFlow from '@number-flow/react'

type TotalTransmittedNodeProps = Node<{}, "TotalTransmittedNode">;

export const TotalTransmittedNode: FC<
  NodeProps<TotalTransmittedNodeProps>
> = () => {
  const { totalTransmitted } = useErrorProcessingStore();
  return (
    <FinishNode title="Количество переданных пакетов">
      <NumberFlow value={totalTransmitted} className="text-lg p-0 text-center" />
    </FinishNode>
  );
};
