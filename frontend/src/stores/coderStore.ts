import { EnumLike, transformPolynomial } from "@/lib/utils";
import { create } from "zustand";

export const PolynomialModeEnum = {
  array: "array",
  binary: "binary",
} as const

export type PolynomialMode = EnumLike<typeof PolynomialModeEnum>

export interface CoderState {
  dataLength: number;
  polynomial: string;
  polynomialMode: PolynomialMode;
}

interface CoderStore extends CoderState {
  setPolynomial: (polynomial: string) => void;
  setDataLength: (dataLenth: number) => void;
  setPolynomialMode: (mode: PolynomialMode) => void;
}

// const arrayRegex = /^\[(\d+,\s+)*(\d+)\]$/
const binaryRegex = /^[0-1]*$/;

export const useCoderStore = create<CoderStore>()((set) => ({
  dataLength: 15,
  polynomial: "[5, 3, 0]",
  polynomialMode: PolynomialModeEnum.array,
  setPolynomial: (polynomial: CoderState["polynomial"]) =>
    set(({ polynomialMode, dataLength }) => {
      if (polynomialMode === PolynomialModeEnum.array) {
        let arr: any;
        try {
          arr = JSON.parse(polynomial || "[]");
        } catch (err) {
          console.error("Error parsing polynomial:", err);
          throw new Error("Неправильное представление в виде массива");
        }
        if (
          !(
            Array.isArray(arr) &&
            arr.every((el) => typeof el === "number" && Number.isInteger(el))
          )
        ) {
          throw new Error(
            "Передаваемое значение должно быть строкой в виде массива ('[5,3,0]')",
          );
        }
        if (Math.max(...arr) >= dataLength) {
          throw new Error("полином должен иметь степень меньше длинны пакета");
        }
        // if (arr.length === 0) {
        //   throw new Error("полином не может иметь нулевую степень");
        // }
      } else {
        if (!binaryRegex.test(polynomial)) {
          console.error("polynomial failed regex: ", polynomial);
          throw new Error("Полином должен представлять собой бинарное число");
        }
        if (polynomial.length >= dataLength) {
          throw new Error("полином должен иметь степень меньше длинны пакета");
        }
        // if (polynomial.length === 0) {
        //   throw new Error("полином не может иметь нулевую степень");
        // }
      }

      return { polynomial };
    }),

  setDataLength: (dataLength: CoderState["dataLength"]) =>
    set(() => {
      return { dataLength };
    }),

  setPolynomialMode: (polynomialMode: PolynomialMode) =>
    set(({ polynomial, polynomialMode: oldMode }) => {
      let newValue: string;
      if (oldMode !== polynomialMode) {
        newValue = transformPolynomial(polynomialMode, polynomial)
      } else {
        newValue = polynomial;
      }
      return { polynomialMode, polynomial: newValue };
    }),
}));
