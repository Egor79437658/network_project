import { create } from "zustand";

export interface ErrorProcessingControls {
  totalPacketsToStop: number;
  totalUndetectedErrorsToStop: number;
}

interface ErrorProcessingState extends ErrorProcessingControls {
  detectedErrors: number;
  undetectedErrors: number;
  totalTransmitted: number;
}

interface ErrorProcessingStore extends ErrorProcessingState {
  setDetectedErrors: (errors: number) => void;
  setUndetectedErrors: (errors: number) => void;
  setTotalTransmitted: (total: number) => void;

  setTotalPacketsToStop: (total: number) => void;
  setTotalUndetectedErrorsToStop: (total: number) => void;
}

export const useErrorProcessingStore = create<ErrorProcessingStore>()(
  (set) => ({
    detectedErrors: 0,
    undetectedErrors: 0,
    totalTransmitted: 0,

    totalPacketsToStop: 1000000,
    totalUndetectedErrorsToStop: 1000,

    setDetectedErrors: (detectedErrors: number) =>
      set(() => {
        return { detectedErrors };
      }),
    setUndetectedErrors: (undetectedErrors: number) =>
      set(() => {
        return { undetectedErrors };
      }),
    setTotalTransmitted: (totalTransmitted: number) =>
      set(() => {
        return { totalTransmitted };
      }),

    setTotalPacketsToStop: (totalPacketsToStop: number) =>
      set(() => {
        return { totalPacketsToStop };
      }),
    setTotalUndetectedErrorsToStop: (totalUndetectedErrorsToStop: number) =>
      set(() => {
        return { totalUndetectedErrorsToStop };
      }),
  }),
);
