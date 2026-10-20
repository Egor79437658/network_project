import * as z from "zod";

export const errorProcessingFormSchema = z.object({
  totalPacketsToStop: z.coerce
    .number<number>()
    .min(128, "Значение не может быть меньше 128")
    .max(1_000_000_000, "Значение не может быть больше 10^9"),
  totalUndetectedErrorsToStop: z.coerce
    .number<number>()
    .min(0, "Значение не может быть меньше 0")
    .max(Number.MAX_SAFE_INTEGER, "Значение слишком большое"),
});
