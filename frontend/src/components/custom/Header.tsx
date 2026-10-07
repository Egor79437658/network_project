import { cn } from "@/lib/utils";
import { FC } from "react";
import { ThemeSwitch } from "./ThemeSwitch";

interface headerProps {
  classname?: string;
}

export const Header: FC<headerProps> = ({ classname }) => {
  return (
    <header className={cn("flex justify-start items-center pl-1", classname)}>
      <ThemeSwitch />
    </header>
  );
};
