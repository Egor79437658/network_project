import { CoderState } from "@/stores/coderStore";
import { ErrorProcessingControls } from "@/stores/errorProcessingStore";
import { NetworlLineState } from "@/stores/networkLineStore";
import { SimulationService } from "@bindings/backend";

export interface startSimulationData {
  coder: CoderState;
  networkLine: NetworlLineState;
  errorProcessing: ErrorProcessingControls;
}

export const startSimulation = (data: startSimulationData) => {
  console.log("simulationState: ", data);
  SimulationService.StartSimulation(data);

};
