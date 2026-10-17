import { CoderState, PolynomialModeEnum } from "@/stores/coderStore";
import { ErrorProcessingControls } from "@/stores/errorProcessingStore";
import { NetworlLineState } from "@/stores/networkLineStore";
import {
  SimulationService,
  SimulationServiceStart,
} from "@bindings/backend/services";
import { transformPolynomial } from "./utils";

export interface startSimulationData {
  coder: CoderState;
  networkLine: NetworlLineState;
  errorProcessing: ErrorProcessingControls;
}

export const startSimulation = (data: startSimulationData) => {
  // console.log("simulationState: ", data);

  if (data.coder.polynomialMode !== PolynomialModeEnum.array) {
    data.coder.polynomial = transformPolynomial(
      PolynomialModeEnum.array,
      data.coder.polynomial,
    );
  }

  const polynomialDegree = Math.max(...JSON.parse(data.coder.polynomial))+1

    data.coder.polynomial = transformPolynomial(
      PolynomialModeEnum.binary,
      data.coder.polynomial,
    );

  const simulationParams: SimulationServiceStart = {
    ...data,
    coder: {
      dataLength: data.coder.dataLength,
      polynomialDegree,
      polynomial: parseInt(data.coder.polynomial, 2),
      messageLength: data.coder.dataLength - data.coder.polynomial.length+1
    },
  };

  SimulationService.StartSimulation(simulationParams);
};
