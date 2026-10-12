import * as z from "zod";

export const networkLineFormSchema = z
  .object({
      mode: z.literal([ "independed", "guilbert"]),
    independedPropability: z
      .coerce.number<number>()
      .min(0, "Вероятность должна быть между 0 и 1")
      .max(1, "Вероятность должна быть между 0 и 1"),
    propabilityInGoodCondition: z
      .coerce.number<number>()
      .min(0, "Вероятность должна быть между 0 и 1")
      .max(1, "Вероятность должна быть между 0 и 1"),
    propabilityInBadCondition: z
      .coerce.number<number>()
      .min(0, "Вероятность должна быть между 0 и 1")
      .max(1, "Вероятность должна быть между 0 и 1"),
    propabilityToGoBad: z
      .coerce.number<number>()
      .min(0, "Вероятность должна быть между 0 и 1")
      .max(1, "Вероятность должна быть между 0 и 1"),
    propabilityToGoGood: z
      .coerce.number<number>()
      .min(0, "Вероятность должна быть между 0 и 1")
      .max(1, "Вероятность должна быть между 0 и 1"),
      
  })
