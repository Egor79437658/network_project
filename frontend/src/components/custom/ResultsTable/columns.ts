import { createColumnHelper } from "@tanstack/react-table";
import { DataTableFeatures } from "./features";
import { SimulationResult } from "@bindings/backend/services";

const columnHelper = createColumnHelper<DataTableFeatures, SimulationResult>();

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
