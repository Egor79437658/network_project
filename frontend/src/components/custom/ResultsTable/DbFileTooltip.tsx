import { DatabaseService } from "@bindings/backend/services";
import { Button } from "@shadcnComponents/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@shadcnComponents/tooltip";
import { Info } from "lucide-react";
import { FC, useEffect, useState } from "react";

export const DbFileTooltip: FC = () => {
  const [path, setPath] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    DatabaseService.GetDbFilePath()
      .then((path) => setPath(path))
      .catch((err) => {
        console.error("error when getting path: ", err);
        setIsError(true);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isError) return <></>;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon">
          <Info />
        </Button>
      </TooltipTrigger>
      <TooltipContent className="text-center">
        {isLoading ? "Загрузка..." : `Данные сохраняются в ${path}`}
      </TooltipContent>
    </Tooltip>
  );
};
