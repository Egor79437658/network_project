import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./components/theme-provider";
import { TooltipProvider } from "@shadcnComponents/tooltip";
import { Toaster } from "@shadcnComponents/sonner";


ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider disableTransitionOnChange={false}>
      <TooltipProvider>
        <App />
        <Toaster visibleToasts={4}/>
      </TooltipProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
