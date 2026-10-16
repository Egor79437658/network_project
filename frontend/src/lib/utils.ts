import { PolynomialMode, PolynomialModeEnum } from "@/stores/coderStore";

export { cn } from "cn";

export const transformPolynomial = (
  to: PolynomialMode,
  polynomial: string,
): string => {
  let newValue: string;
  if (to === PolynomialModeEnum.binary) {
    const arr: number[] = JSON.parse(polynomial || "[]");
    newValue = arr
      .sort((a, b) => b - a)
      .reduce((sum, val) => sum + 2 ** val, 0)
      .toString(2);
  } else {
    newValue = JSON.stringify(
      polynomial
        .split("")
        .reverse()
        .map((c, i) => {
          if (c == "1") return i;
        })
        .filter((v) => v !== undefined).reverse(),
    );
  }

  return newValue;
};

export type EnumLike<T> = T[keyof T];
export type EnumPick<T, K extends keyof T> = T[K];