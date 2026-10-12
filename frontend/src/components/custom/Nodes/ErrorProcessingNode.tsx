import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import { FC } from "react";
import { DefaultNode } from "./DefaultNode";
import { NodePopover } from "@customComponents/NodePopover";
import { ErrorProcessingForm } from "@customComponents/Forms/ErrorProcessingForm";

type ErrorProcessingNodeProps = Node<{}, "ErrorProcessingNode">;

export const ErrorProcessingNode: FC<
  NodeProps<ErrorProcessingNodeProps>
> = () => {
  return (
    <DefaultNode
      centeredTitle
      title="Обработчик результатов"
      className="min-w-130 min-h-60"
    >
      <div className="font-bold">
        <div className="absolute top-2 left-4">Оригальные данные</div>
        <div className="absolute top-1/2 -translate-y-1/2 left-4 w-min">
          Расшифрованные данные
        </div>
        <div className="absolute bottom-3.5 left-4">Наличие ошибки</div>

        <div className="absolute top-2 right-4">Обнаруженные ошибки</div>
        <div className="absolute top-1/2 right-8 -translate-y-1/2 w-min">
          Пропущенные ошибки
        </div>
        <div className="absolute bottom-3.5 right-4">Переданные пакеты</div>
      </div>

      <NodePopover>
        <ErrorProcessingForm />
      </NodePopover>

      <Handle
        type="target"
        position={Position.Left}
        id="originalData"
        style={{ top: 15 }}
      />
      <Handle type="target" position={Position.Left} id="decodedData" />
      <Handle
        type="target"
        position={Position.Left}
        id="isError"
        style={{ bottom: 15, top: "auto" }}
      />

      <Handle
        type="source"
        position={Position.Right}
        id="DetectedErrorsCount"
        style={{ top: 15 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="UndetectedErrorsCount"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="TotalPackets"
        style={{ bottom: 15, top: "auto" }}
      />
    </DefaultNode>
  );
};
