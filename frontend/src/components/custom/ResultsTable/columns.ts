import { createColumnHelper } from "@tanstack/react-table";
import { DataTableFeatures } from "./features";
import { SimulationResult } from "@bindings/backend/services";

export interface SimulationResultExtended extends SimulationResult {
  acceptedPackets: number
}

const columnHelper = createColumnHelper<DataTableFeatures, SimulationResultExtended>();

export const columns = columnHelper.columns([
  columnHelper.accessor("id", {
    header: "ID",
  }),
  columnHelper.accessor("dataLength", {
    header: "Размер пакета",
  }),
  columnHelper.accessor("messageLength", {
    header: "Размер сообщения",
  }),
  columnHelper.accessor("polynomial", {
    header: "Полином",
  }),
  columnHelper.accessor("networkParams.mode", {
    header: "Модель ошибок",
  }),
  columnHelper.accessor("networkParams", {
    header: "Вероятность ошибки",
  }),
  columnHelper.accessor("acceptedPackets", {
    header: "Правильных пакетов",
  }),
  columnHelper.accessor("detectedErrors", {
    header: "Обнаружено ошибок",
  }),
  columnHelper.accessor("undetectedErrors", {
    header: "Пропущено ошибок",
  }),
  columnHelper.accessor("totalTransmited", {
    header: "Переданно пакетов",
  }),
]);
