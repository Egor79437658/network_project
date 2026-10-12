import { FC } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@shadcnComponents/field";
import { Button } from "@shadcnComponents/button";
import { Save } from "lucide-react";
import { Input } from "@shadcnComponents/input";
import {
  ErrorProcessingControls,
  useErrorProcessingStore,
} from "@/stores/errorProcessingStore";
import { errorProcessingFormSchema } from "./schemas/errorProcessingFormSchema";

interface InputArrayElement {
  key: keyof ErrorProcessingControls;
  label: string;
}

export const ErrorProcessingForm: FC = () => {
  const errorProcessingState = useErrorProcessingStore();

  const form = useForm<z.infer<typeof errorProcessingFormSchema>>({
    resolver: zodResolver(errorProcessingFormSchema),
    defaultValues: {
      totalPacketsToStop: errorProcessingState.totalPacketsToStop,
      totalUndetectedErrorsToStop:
        errorProcessingState.totalUndetectedErrorsToStop,
    },
  });

  function onSubmit(data: z.infer<typeof errorProcessingFormSchema>) {
    errorProcessingState.setTotalPacketsToStop(data.totalPacketsToStop);
    errorProcessingState.setTotalUndetectedErrorsToStop(
      data.totalUndetectedErrorsToStop,
    );
    toast.success("Данные сохранены!");
  }

  const inputArrays: InputArrayElement[] = [
    { key: "totalPacketsToStop", label: "Переданных блоков до остановки" },
    {
      key: "totalUndetectedErrorsToStop",
      label: "Пропущенных ошибок до остановки",
    },
  ];

  return (
    <form
      id="error-processing-form"
      onSubmit={form.handleSubmit(onSubmit, (err) =>
        console.error("error subbmiting form: ", err),
      )}
    >
      <FieldGroup>
        {inputArrays.map((el: InputArrayElement) => (
          <Controller
            key={el.key}
            name={el.key}
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={el.key}>{el.label}</FieldLabel>
                <div className="flex gap-4">
                  <Input
                    {...field}
                    type="number"
                    // min={0}
                    // max={1}
                    id={el.key}
                    aria-invalid={fieldState.invalid}
                  />
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        ))}
      </FieldGroup>
      <div className="pt-8 flex justify-center">
        <Button type="submit" className="px-6">
          <Save />
        </Button>
      </div>
    </form>
  );
};
