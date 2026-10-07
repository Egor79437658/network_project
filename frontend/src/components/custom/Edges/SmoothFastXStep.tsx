import {
  BaseEdge,
  type EdgeProps,
  type Edge,
  getSmoothStepPath,
} from "@xyflow/react";
import { FC } from "react";

type CustomEdge = Edge<{}, "SmoothFast">;

export const SmoothFastXStep: FC<EdgeProps<CustomEdge>> = (props) => {
  const stepX = props.sourceX + (props.targetX - props.sourceX) * 0.05;

  const [edgePath] = getSmoothStepPath({ ...props, centerX: stepX });
  console.log()

  return <BaseEdge id={props.id} path={edgePath} />;
};
