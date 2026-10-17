import { cn } from "@/lib/utils";
import { FC } from "react";
import { ThemeSwitch } from "./ThemeSwitch";
import { Button } from "@shadcnComponents/button";
import { CodeXml } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@shadcnComponents/tooltip";
import { toast } from "sonner";
import { SimulationService } from "@bindings/backend/services";

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
          "underline transition-opacity opacity-100 mr-auto",
          hideShowDataButton && "opacity-0",
        )}
        onClick={onShowData}
      >
        Показать таблицу
      </Button>{" "}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            onClick={() =>
              toast.promise(SimulationService.OpenSourceCode(), {
                loading: "Открываем...",
                success: "Страница открытав вашем браузере!",
                error: "При открытии что-то пошло не так!",
              })
            }
          >
            <CodeXml />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="mr-1">Открыть исходный код</TooltipContent>
      </Tooltip>
    </header>
  );
};
