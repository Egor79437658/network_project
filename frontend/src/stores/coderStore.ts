import { create } from "zustand";

interface CoderState {
  dataLength: number;
  polinomial: string;
  polinomialMode: "array" | "binary";
  setPolinomial: (polinomial: string) => void;
  setDataLength: (dataLenth: number) => void;
  setPolinomialMode: (mode: "array" | "binary") => void;
}

// const arrayRegex = /^\[(\d+,\s+)*(\d+)\]$/
const binaryRegex = /^[0-1]*$/;

export const useCoderStore = create<CoderState>()((set) => ({
  dataLength: 15,
  polinomial: "[5, 3, 0]",
  polinomialMode: "array",
  setPolinomial: (polinomial: CoderState["polinomial"]) =>
    set(({ polinomialMode, dataLength }) => {
      if (polinomialMode === "array") {
        let arr: any;
        try {
          arr = JSON.parse(polinomialMode);
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
        if (arr.length > dataLength) {
          throw new Error(
            "полином не может иsметь степень больше длинны пакета",
          );
        }
        // if (arr.length === 0) {
        //   throw new Error("полином не может иметь нулевую степень");
        // }
      } else {
        if (!binaryRegex.test(polinomial)) {
          console.error("polinomial failed regex: ", polinomial);
          throw new Error("Полином должен представлять собой бинарное число");
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

  setPolinomialMode: (polinomialMode: CoderState["polinomialMode"]) =>
    set(({ polinomial, polinomialMode: oldMode }) => {
      let newValue: string;
      if (oldMode !== polinomialMode) {
        if (oldMode === "array") {
          const arr: number[] = JSON.parse(polinomialMode);
          newValue = arr
            .sort((a, b) => b - a)
            .reduce((sum, val) => sum + 2 ** val, 0)
            .toString(2);
        } else {
          newValue = JSON.stringify(
            polinomial
              .split("")
              .map((c, i) => {
                if (c == "1") return i;
              })
              .filter((v) => v !== undefined)
              .toString(),
          );
        }
      } else {
        newValue = polinomial;
      }
      return { polinomialMode, polinomial: newValue };
    }),
}));
