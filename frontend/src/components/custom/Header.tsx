import { cn } from "@/lib/utils";
import { FC } from "react";
import { ThemeSwitch } from "./ThemeSwitch";
import { Button } from "@shadcnComponents/button";

interface headerProps {
  onShowData: () => void;
  hideShowDataButton: boolean;
  classname?: string;
}

export const Header: FC<headerProps> = ({
  classname,
  hideShowDataButton,
  onShowData,
}) => {
  return (
    <header
      className={cn("flex justify-start gap-4 items-center pl-1", classname)}
    >
      <ThemeSwitch />
      <Button
        variant="ghost"
        className={cn(
          "underline transition-opacity opacity-100",
          hideShowDataButton && "opacity-0",
        )}
        onClick={onShowData}
      >
        Показать таблицу
      </Button>
    </header>
  );
};
