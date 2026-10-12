import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardTitle,
} from "@shadcnComponents/card";
import { FC } from "react";

interface DefaultNodeProps {
  title: string;
  className?: string;
  children: React.ReactNode;
  centeredTitle?: boolean
}

export const DefaultNode: FC<DefaultNodeProps> = ({
  title,
  className,
  children,
  centeredTitle = false,
}) => {
  return (
    <Card size="sm" className={cn("border-3 border-accent p-4 bg-muted dark:bg-background/70", className)}>
      <CardTitle className={cn("text-center", centeredTitle && "absolute top-1/2 left-1/2 -translate-1/2")}>{title}</CardTitle>
      <CardContent>{children}</CardContent>
      <CardFooter />
    </Card>
  );
  // return (
  //   <div className={cn("rounded-2xl bg-accent p-4", className)}>
  //     <h3>{title}</h3>
  //     <div>{children}</div>
  //   </div>
  // );
};
