import { create } from "zustand";

interface NetworlLineState {
  mode: "independed" | "guilbert";
  independedPropability: number;

  propabilityInGoodCondition: number;
  propabilityInBadCondition: number;
  propabilityToGoBad: number;
  propabilityToGoGood: number;

  setMode: (mode: "independed" | "guilbert") => void;
  setIndependedPropability: (propability: number) => void;
  setPropabilityInGoodCondition: (propability: number) => void;
  setPropabilityInBadCondition: (propability: number) => void;
  setPropabilityToGoBad: (propability: number) => void;
  setPropabilityToGoGood: (propability: number) => void;
}

export const useNetworkLineStore = create<NetworlLineState>()((set) => ({
  mode: "independed",
  independedPropability: 0.01,

  propabilityInGoodCondition: 0,
  propabilityInBadCondition: 0.5,
  propabilityToGoBad: 0.001,
  propabilityToGoGood: 0.1,

  setMode: (mode: NetworlLineState["mode"]) =>
    set(() => {
      return { mode };
    }),
  setIndependedPropability: (propability: number) =>
    set(() => {
      if (propability < 0 || propability > 1) {
        throw new Error("Вероятность должна быть между 0 и 1");
      }
      return { independedPropability: propability };
    }),

  setPropabilityInGoodCondition: (propability: number) =>
    set(() => {
      if (propability < 0 || propability > 1) {
        throw new Error("Вероятность должна быть между 0 и 1");
      }
      return { propabilityInGoodCondition: propability };
    }),
  setPropabilityInBadCondition: (propability: number) =>
    set(() => {
      if (propability < 0 || propability > 1) {
        throw new Error("Вероятность должна быть между 0 и 1");
      }
      return { propabilityInBadCondition: propability };
    }),
  setPropabilityToGoBad: (propability: number) =>
    set(() => {
      if (propability < 0 || propability > 1) {
        throw new Error("Вероятность должна быть между 0 и 1");
      }
      return { propabilityToGoBad: propability };
    }),
  setPropabilityToGoGood: (propability: number) =>
    set(() => {
      if (propability < 0 || propability > 1) {
        throw new Error("Вероятность должна быть между 0 и 1");
      }
      return { propabilityToGoGood: propability };
    }),
}));
