import { PolinomialMode } from "@bindings/backend";
import * as z from "zod";

const binaryRegex = /^[0-1]*$/;

export const coderFormSchema = z
  .object({
    dataLength: z.coerce
      .number<number>()
      .min(2, "размер пакета должен быть не менее 2")
      .max(127, "размер пакета должен быть не более 127"),
    polinomial: z.string(),
    polinomialMode: z.enum(PolinomialMode),
  })
  .refine(
    //check if string is valid
    ({ polinomial, polinomialMode }) => {
      if (polinomialMode === PolinomialMode.Array) {
        let arr: any;
        try {
          arr = JSON.parse(polinomial || "[]");
        } catch (err) {
          return false;
        }
        if (
          !(
            Array.isArray(arr) &&
            arr.every((el) => typeof el === "number" && Number.isInteger(el))
          )
        ) {
          return false;
        }
      }
      return true;
    },
    {
      error:
        "Передаваемое значение должно быть строкой в виде массива ('[5,3,0]')",
      path: ["polinomial"],
      abort: true,
    },
  )
  .refine(
    //check if string is valid
    ({ polinomial, polinomialMode }) => {
      if (polinomialMode === PolinomialMode.Binary) {
        if (!binaryRegex.test(polinomial)) {
          return false;
        }
      }
      return true;
    },
    {
      error: "Полином должен представлять собой бинарное число",
      path: ["polinomial"],
      abort: true,
    },
  )
  .refine(
    // check length
    ({ polinomial, polinomialMode, dataLength }) => {
      if (polinomialMode === PolinomialMode.Array) {
        const arr: number[] = JSON.parse(polinomial || "[]");
        if (Math.max(...arr) >= dataLength) {
          return false;
        }
      } else {
        if (polinomial.length >= dataLength) {
          return false;
        }
      }
      return true;
    },
    {
      error: "полином должен иметь степень меньше длинны пакета",
      path: ["polinomial"],
      abort: true,
    },
  );
