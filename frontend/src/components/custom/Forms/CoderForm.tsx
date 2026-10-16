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
import { PolynomialModeEnum, useCoderStore } from "@/stores/coderStore";
import { transformPolynomial } from "@/lib/utils";

export const CoderForm: FC = () => {
  const coderState = useCoderStore();

  const form = useForm<z.infer<typeof coderFormSchema>>({
    resolver: zodResolver(coderFormSchema),
    defaultValues: {
      dataLength: coderState.dataLength,
      polynomial: coderState.polynomial,
      polynomialMode: coderState.polynomialMode,
    },
  });

  const polynomial = form.watch("polynomial");

  function onSubmit(data: z.infer<typeof coderFormSchema>) {
    coderState.setDataLength(data.dataLength)
    coderState.setPolynomialMode(data.polynomialMode)
    coderState.setPolynomial(data.polynomial)
    toast.success("Данные сохранены!")
  }

  return (
    <form
      id="coder-form"
      onSubmit={form.handleSubmit(onSubmit, (err) => console.error("error subbmiting form: ", err))}
    >
      <FieldGroup>
        <Controller
          name="polynomialMode"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="polynomialMode">
                Режим задания полинома:
              </FieldLabel>
              <div className="flex gap-4">
                <FieldLabel htmlFor="polynomialMode">массив</FieldLabel>
                <Switch
                  {...field}
                  id="polynomialMode"
                  onCheckedChange={(checked) => {
                    field.onChange(checked ? PolynomialModeEnum.binary : PolynomialModeEnum.array);
                    form.setValue(
                      "polynomial",
                      transformPolynomial(
                        checked ? PolynomialModeEnum.binary : PolynomialModeEnum.array,
                        polynomial,
                      ),
                    );
                  }}
                  size="sm"
                  aria-invalid={fieldState.invalid}
                />
                <FieldLabel htmlFor="polynomialMode">бинарное число</FieldLabel>
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="polynomial"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="polynomial">Полином:</FieldLabel>
              <div className="flex gap-4">
                <Input
                  {...field}
                  type="text"
                  id="polynomial"
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
