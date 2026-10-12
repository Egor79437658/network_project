export { cn } from "cn";

export const transformPolinomial = (
  to: "array" | "binary",
  polinomial: string,
): string => {
  let newValue: string;
  if (to === "binary") {
    const arr: number[] = JSON.parse(polinomial || "[]");
    newValue = arr
      .sort((a, b) => b - a)
      .reduce((sum, val) => sum + 2 ** val, 0)
      .toString(2);
  } else {
    newValue = JSON.stringify(
      polinomial
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
