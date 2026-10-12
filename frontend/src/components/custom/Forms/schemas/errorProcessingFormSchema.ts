import * as z from "zod";

export const errorProcessingFormSchema = z.object({
  totalPacketsToStop: z.coerce
    .number<number>()
    .min(128, "Значение не может быть меньше 128")
    .max(Number.MAX_SAFE_INTEGER, "Значение слишком большое"),
  totalUndetectedErrorsToStop: z.coerce
    .number<number>()
    .min(1, "Значение не может быть меньше 1")
    .max(Number.MAX_SAFE_INTEGER, "Значение слишком большое"),
});
