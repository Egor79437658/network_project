import { transformPolinomial } from "@/lib/utils";
import { create } from "zustand";
import { PolinomialMode } from "@bindings/backend";

export interface CoderState {
  dataLength: number;
  polinomial: string;
  polinomialMode: PolinomialMode;
}

interface CoderStore extends CoderState {
  setPolinomial: (polinomial: string) => void;
  setDataLength: (dataLenth: number) => void;
  setPolinomialMode: (mode: PolinomialMode) => void;
}

// const arrayRegex = /^\[(\d+,\s+)*(\d+)\]$/
const binaryRegex = /^[0-1]*$/;

export const useCoderStore = create<CoderStore>()((set) => ({
  dataLength: 15,
  polinomial: "[5, 3, 0]",
  polinomialMode: PolinomialMode.Array,
  setPolinomial: (polinomial: CoderState["polinomial"]) =>
    set(({ polinomialMode, dataLength }) => {
      if (polinomialMode === PolinomialMode.Array) {
        let arr: any;
        try {
          arr = JSON.parse(polinomial || "[]");
        } catch (err) {
          console.error("Error parsing polinomial:", err);
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
        if (!binaryRegex.test(polinomial)) {
          console.error("polinomial failed regex: ", polinomial);
          throw new Error("Полином должен представлять собой бинарное число");
        }
        if (polinomial.length >= dataLength) {
          throw new Error("полином должен иметь степень меньше длинны пакета");
        }
        // if (polinomial.length === 0) {
        //   throw new Error("полином не может иметь нулевую степень");
        // }
      }

      return { polinomial };
    }),

  setDataLength: (dataLength: CoderState["dataLength"]) =>
    set(() => {
      return { dataLength };
    }),

  setPolinomialMode: (polinomialMode: PolinomialMode) =>
    set(({ polinomial, polinomialMode: oldMode }) => {
      let newValue: string;
      if (oldMode !== polinomialMode) {
        newValue = transformPolinomial(polinomialMode, polinomial)
      } else {
        newValue = polinomial;
      }
      return { polinomialMode, polinomial: newValue };
    }),
}));
