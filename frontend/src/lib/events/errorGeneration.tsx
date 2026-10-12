import { Field, FieldLabel } from "@shadcnComponents/field";
import { Progress } from "@shadcnComponents/progress";
import { Events, WML } from "@wailsio/runtime";
import { toast } from "sonner";

const position = "bottom-center";

export const handleErrorGenerationProgress = () => {
  const toastId = toast.loading(
    <Field className="w-full max-w-sm">
      <FieldLabel htmlFor="progress-upload">
        <span className="mr-auto">Генерация ошибок</span>
        <span>0%</span>
      </FieldLabel>
      <Progress value={0} id="error-generation-progress" />
    </Field>,
    { duration: Infinity, position: position },
  );

  const unsubscribeProgress = Events.On(
    "error-generation:progress",
    (event: Events.WailsEvent<"error-generation:progress">) => {
      const progress = Math.round((event.data + Number.EPSILON) * 100) / 100;

      if (progress === 100) {
        unsubscribeProgress();
      } else {
        toast.loading(
          <Field className="w-full max-w-sm">
            <FieldLabel htmlFor="progress-upload">
              <span className="mr-auto">Генерация ошибок</span>
              <span>{progress}%</span>
            </FieldLabel>
            <Progress value={progress} id="error-generation-progress" />
          </Field>,
          { id: toastId, duration: Infinity, position: position },
        );
      }
    },
  );
  const unsubscribeFinished = Events.On(
    "error-generation:finished",
    (event: Events.WailsEvent<"error-generation:finished">) => {
      toast.success("Ошибки сгенерированны!", {
        id: toastId,
        duration: 4000,
        position: position,
      });
      unsubscribeFinished();
      unsubscribeError();
      unsubscribeProgress();
    },
  );
  const unsubscribeError = Events.On(
    "error-generation:error",
    (event: Events.WailsEvent<"error-generation:error">) => {
      toast.error("При генерации ошибок произошла ошибка!", {
        id: toastId,
        description: event.data,
        duration: 4000,
        position: position,
      });
      unsubscribeError();
      unsubscribeFinished();
      unsubscribeProgress();
    },
  );
  WML.Reload();
};
