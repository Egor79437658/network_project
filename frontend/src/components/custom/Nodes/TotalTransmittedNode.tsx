import { useErrorProcessingStore } from "@/stores/errorProcessingStore";
import { FC } from "react";
import { FinishNode } from "./FinishNode";
import { Node, NodeProps } from "@xyflow/react";

type TotalTransmittedNodeProps = Node<{}, "TotalTransmittedNode">;

export const TotalTransmittedNode: FC<NodeProps<TotalTransmittedNodeProps>> = () => {
  const { totalTransmitted } = useErrorProcessingStore();
  return (
    <FinishNode title="Количество переданных пакетов">
      {totalTransmitted}
    </FinishNode>
  );
};
