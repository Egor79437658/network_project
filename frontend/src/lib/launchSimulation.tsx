import { CoderState } from "@/stores/coderStore";
import { ErrorProcessingControls } from "@/stores/errorProcessingStore";
import { NetworlLineState } from "@/stores/networkLineStore";
import { Field, FieldLabel } from "@shadcnComponents/field";
import { Progress } from "@shadcnComponents/progress";
import { Events, WML } from "@wailsio/runtime";
import { toast } from "sonner";
import { SimulationService } from "@/../bindings/changeme";

export interface startSimulationData {
  coder: CoderState;
  networkLine: NetworlLineState;
  errorProcessing: ErrorProcessingControls;
}

export const startSimulation = (data: startSimulationData) => {
  console.log("simulationState: ", data);
  SimulationService.StartSimulation(data);

  let progress = 0;

  const toastId = toast.loading(
    <Field className="w-full max-w-sm">
      <FieldLabel htmlFor="progress-upload">
        <span className="mr-auto">Прогресс</span>
        <span>{progress}%</span>
      </FieldLabel>
      <Progress value={progress} id="progress-simulation" />
    </Field>,
    { duration: Infinity },
  );

  const unsubscribe = Events.On(
    "simulation:progress",
    (event: Events.WailsEvent<"simulation:progress">) => {
      const progress = event.data;
      if (progress === 100) {
        toast.success("Конец!", {
          id: toastId,
          duration: 4000,
        });
        unsubscribe()
      } else {
        toast.loading(
          <Field className="w-full max-w-sm">
            <FieldLabel htmlFor="progress-upload">
              <span className="mr-auto">Прогресс</span>
              <span>{progress}%</span>
            </FieldLabel>
            <Progress value={progress} id="progress-simulation" />
          </Field>,
          { id: toastId, duration: Infinity },
        );
      }
    },
  );
  WML.Reload();
};
