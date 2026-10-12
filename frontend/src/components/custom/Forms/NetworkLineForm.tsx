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
import { Switch } from "@shadcnComponents/switch";
import { Button } from "@shadcnComponents/button";
import { Save } from "lucide-react";
import { Input } from "@shadcnComponents/input";
import {
  NetworlLineState,
  useNetworkLineStore,
} from "@/stores/networkLineStore";
import { networkLineFormSchema } from "./schemas/networkLineFormSchema";
import { NetworkLineMode } from "@bindings/backend";

interface InputArrayElement {
  key: keyof Omit<NetworlLineState, "mode">;
  label: string;
}

export const NetworkLineForm: FC = () => {
  const networkState = useNetworkLineStore();

  const form = useForm<z.infer<typeof networkLineFormSchema>>({
    resolver: zodResolver(networkLineFormSchema),
    defaultValues: {
      mode: networkState.mode,
      independedPropability: networkState.independedPropability,
      propabilityInGoodCondition: networkState.propabilityInGoodCondition,
      propabilityInBadCondition: networkState.propabilityInBadCondition,
      propabilityToGoBad: networkState.propabilityToGoBad,
      propabilityToGoGood: networkState.propabilityToGoGood,
    },
  });

  const lineMode = form.watch("mode");

  function onSubmit(data: z.infer<typeof networkLineFormSchema>) {
    networkState.setMode(data.mode);
    networkState.setIndependedPropability(data.independedPropability);
    networkState.setPropabilityInGoodCondition(data.propabilityInGoodCondition);
    networkState.setPropabilityInBadCondition(data.propabilityInBadCondition);
    networkState.setPropabilityToGoBad(data.propabilityToGoBad);
    networkState.setPropabilityToGoGood(data.propabilityToGoGood);
    toast.success("Данные сохранены!");
  }

  const inputArrays: InputArrayElement[] =
    lineMode === NetworkLineMode.Independed
      ? [{ key: "independedPropability", label: "Вероятность ошибки:" }]
      : [
          {
            key: "propabilityInGoodCondition",
            label: 'Вероятность ошибки в "хорошем" состоянии:',
          } satisfies InputArrayElement,
          {
            key: "propabilityInBadCondition",
            label: 'Вероятность ошибки в "плохом" состоянии:',
          },
          {
            key: "propabilityToGoGood",
            label: 'Вероятность перейти в "хорошее" состояние',
          },
          {
            key: "propabilityToGoBad",
            label: 'Вероятность перейти в "плохое" состояние',
          },
        ];

  return (
    <form
      id="network-line-form"
      onSubmit={form.handleSubmit(onSubmit, (err) =>
        console.error("error subbmiting form: ", err),
      )}
    >
      <FieldGroup>
        <Controller
          name="mode"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="mode">Модель ошибок:</FieldLabel>
              <div className="flex gap-4">
                <FieldLabel htmlFor="mode">Незывисимые ошибки</FieldLabel>
                <Switch
                  {...field}
                  id="mode"
                  onCheckedChange={(checked) => {
                    field.onChange(
                      checked
                        ? NetworkLineMode.Guilbert
                        : NetworkLineMode.Independed,
                    );
                  }}
                  size="sm"
                  aria-invalid={fieldState.invalid}
                />
                <FieldLabel htmlFor="polinomialMode">
                  Модель гильберта
                </FieldLabel>
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
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
