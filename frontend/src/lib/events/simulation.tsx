import { Field, FieldLabel } from "@shadcnComponents/field";
import { Progress } from "@shadcnComponents/progress";
import { Events, WML } from "@wailsio/runtime";
import { toast } from "sonner";

export const handleSimulationProgress = () => {
  const toastId = toast.loading(
    <Field className="w-full max-w-sm">
      <FieldLabel htmlFor="progress-upload">
        <span className="mr-auto">Прогресс</span>
        <span>0%</span>
      </FieldLabel>
      <Progress value={0} id="progress-simulation" />
    </Field>,
    { duration: Infinity },
  );

  const unsubscribeProgress = Events.On(
    "simulation:progress",
    (event: Events.WailsEvent<"simulation:progress">) => {
      const progress = event.data;
      if (progress === 100) {
        unsubscribeProgress();
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
  const unsubscribeFinished = Events.On(
    "simulation:finished",
    (event: Events.WailsEvent<"simulation:finished">) => {
      toast.success("Конец!", {
        id: toastId,
        duration: 4000,
      });
      unsubscribeFinished();
      unsubscribeError();
      unsubscribeProgress();
    },
  );
  const unsubscribeError = Events.On(
    "simulation:error",
    (event: Events.WailsEvent<"simulation:error">) => {
      toast.error("При моделировании произошла ошибка!", {
        id: toastId,
        description: event.data,
        duration: 4000,
      });
      unsubscribeError();
      unsubscribeFinished();
      unsubscribeProgress();
    },
  );
  WML.Reload();
};
