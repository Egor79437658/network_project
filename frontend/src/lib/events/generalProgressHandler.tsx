import { Field, FieldLabel } from "@shadcnComponents/field";
import { Progress } from "@shadcnComponents/progress";
import { Events, WML } from "@wailsio/runtime";
import { toast } from "sonner";

type Position =
  | "bottom-center"
  | "bottom-left"
  | "bottom-right"
  | "top-center"
  | "top-left"
  | "top-right";
type EventSource =
  | "simulation"
  | "error-generation"
  | "data-generation"
  | "coder"
  | "decoder";

export const handleProgressEvents = (
  eventSource: EventSource,
  label: string,
  successMessage: string,
  errorMessage: string,
  position?: Position,
) => {
  const toastId = toast.loading(
    <Field className="w-full max-w-sm">
      <FieldLabel htmlFor={`progress-${eventSource}`}>
        <span className="mr-auto">{label}</span>
        <span>0%</span>
      </FieldLabel>
      <Progress value={0} id={`progress-${eventSource}`} />
    </Field>,
    { duration: Infinity, position },
  );

  const unsubscribeProgress = Events.On(
    `${eventSource}:progress`,
    (event: Events.WailsEvent<`${EventSource}:progress`>) => {
      const progress = Math.round(event.data*100)/100;
      if (progress === 100) {
        unsubscribeProgress();
      } else {
        toast.loading(
          <Field className="w-full max-w-sm">
            <FieldLabel htmlFor={`progress-${eventSource}`}>
              <span className="mr-auto">{label}</span>
              <span>{progress}%</span>
            </FieldLabel>
            <Progress value={progress} id={`progress-${eventSource}`} />
          </Field>,
          { id: toastId, duration: Infinity, position },
        );
      }
    },
  );
  const unsubscribeFinished = Events.On(
    `${eventSource}:finished`,
    (event: Events.WailsEvent<`${EventSource}:finished`>) => {
      toast.success(successMessage, {
        id: toastId,
        duration: 4000,
        position,
      });
      unsubscribeFinished();
      unsubscribeError();
      unsubscribeProgress();
    },
  );
  const unsubscribeError = Events.On(
    `${eventSource}:error`,
    (event: Events.WailsEvent<`${EventSource}:error`>) => {
      toast.error(errorMessage, {
        id: toastId,
        description: event.data,
        duration: 4000,
        position,
      });
      unsubscribeError();
      unsubscribeFinished();
      unsubscribeProgress();
    },
  );
  WML.Reload();
};
