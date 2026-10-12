import { CoderState } from "@/stores/coderStore";
import { ErrorProcessingControls } from "@/stores/errorProcessingStore";
import { NetworlLineState } from "@/stores/networkLineStore";
import { Field, FieldLabel } from "@shadcnComponents/field";
import { Progress } from "@shadcnComponents/progress";
import { toast } from "sonner";

export interface startSimulationData {
  coder: CoderState;
  networkLine: NetworlLineState;
  errorProcessing: ErrorProcessingControls;
}

export const startSimulation = (data: startSimulationData) => {
  console.log("simulationState: ", data);

  let progress = 0;

  toast.success("Симуляция начата!")

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

  const interval = setInterval(() => {
    progress += 20;

    if (progress >= 100) {
      clearInterval(interval);
      toast.success("Конец!", {
        id: toastId,
        duration: 4000,
      });
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
  }, 5000);
};
