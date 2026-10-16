import { PolynomialModeEnum } from "@/stores/coderStore";
import * as z from "zod";

const binaryRegex = /^[0-1]*$/;

export const coderFormSchema = z
  .object({
    dataLength: z.coerce
      .number<number>()
      .min(2, "размер пакета должен быть не менее 2")
      .max(64, "размер пакета должен быть не более 64"),
    polynomial: z.string(),
    polynomialMode: z.enum(PolynomialModeEnum),
  })
  .refine(
    //check if string is valid
    ({ polynomial, polynomialMode }) => {
      if (polynomialMode === PolynomialModeEnum.array) {
        let arr: any;
        try {
          arr = JSON.parse(polynomial || "[]");
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
      path: ["polynomial"],
      abort: true,
    },
  )
  .refine(
    //check if string is valid
    ({ polynomial, polynomialMode }) => {
      if (polynomialMode === PolynomialModeEnum.binary) {
        if (!binaryRegex.test(polynomial)) {
          return false;
        }
      }
      return true;
    },
    {
      error: "Полином должен представлять собой бинарное число",
      path: ["polynomial"],
      abort: true,
    },
  )
  .refine(
    // check length
    ({ polynomial, polynomialMode, dataLength }) => {
      if (polynomialMode === PolynomialModeEnum.array) {
        const arr: number[] = JSON.parse(polynomial || "[]");
        if (Math.max(...arr) >= dataLength) {
          return false;
        }
      } else {
        if (polynomial.length >= dataLength) {
          return false;
        }
      }
      return true;
    },
    {
      error: "полином должен иметь степень меньше длинны пакета",
      path: ["polynomial"],
      abort: true,
    },
  );
