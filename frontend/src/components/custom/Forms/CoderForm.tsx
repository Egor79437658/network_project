import { FC } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import * as z from "zod";
import { coderFormSchema } from "./schemas/coderFormSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@shadcnComponents/field";
import { Switch } from "@shadcnComponents/switch";
import { Button } from "@shadcnComponents/button";
import { Save } from "lucide-react";
import { Input } from "@shadcnComponents/input";
import { useCoderStore } from "@/stores/coderStore";
import { transformPolinomial } from "@/lib/utils";
import { PolinomialMode } from "@bindings/backend";

export const CoderForm: FC = () => {
  const coderState = useCoderStore();

  const form = useForm<z.infer<typeof coderFormSchema>>({
    resolver: zodResolver(coderFormSchema),
    defaultValues: {
      dataLength: coderState.dataLength,
      polinomial: coderState.polinomial,
      polinomialMode: coderState.polinomialMode,
    },
  });

  const polinomial = form.watch("polinomial");

  function onSubmit(data: z.infer<typeof coderFormSchema>) {
    coderState.setDataLength(data.dataLength)
    coderState.setPolinomialMode(data.polinomialMode)
    coderState.setPolinomial(data.polinomial)
    toast.success("Данные сохранены!")
  }

  return (
    <form
      id="coder-form"
      onSubmit={form.handleSubmit(onSubmit, (err) => console.error("error subbmiting form: ", err))}
    >
      <FieldGroup>
        <Controller
          name="polinomialMode"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="polinomialMode">
                Режим задания полинома:
              </FieldLabel>
              <div className="flex gap-4">
                <FieldLabel htmlFor="polinomialMode">массив</FieldLabel>
                <Switch
                  {...field}
                  id="polinomialMode"
                  onCheckedChange={(checked) => {
                    field.onChange(checked ? PolinomialMode.Binary : PolinomialMode.Array);
                    form.setValue(
                      "polinomial",
                      transformPolinomial(
                        checked ? PolinomialMode.Binary : PolinomialMode.Array,
                        polinomial,
                      ),
                    );
                  }}
                  size="sm"
                  aria-invalid={fieldState.invalid}
                />
                <FieldLabel htmlFor="polinomialMode">бинарное число</FieldLabel>
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="polinomial"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="polinomial">Полином:</FieldLabel>
              <div className="flex gap-4">
                <Input
                  {...field}
                  type="text"
                  id="polinomial"
                  aria-invalid={fieldState.invalid}
                />
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="dataLength"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="dataLength">Размер блока (n):</FieldLabel>
              <div className="flex gap-4">
                <Input
                  {...field}
                  id="dataLength"
                  aria-invalid={fieldState.invalid}
                />
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      <div className="pt-8 flex justify-center">
        <Button type="submit" className="px-6">
          <Save />
        </Button>
      </div>
    </form>
  );
};
