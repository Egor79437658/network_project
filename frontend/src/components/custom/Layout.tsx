import { FC, useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@shadcnComponents/resizable";
import { usePanelRef } from "react-resizable-panels";
import { ResultsTable } from "./ResultsTable";

export const Layout: FC = () => {
  const panelRef = usePanelRef();
  const [isCollapsed, setIsCollapsed] = useState(
    !!!panelRef.current?.isCollapsed(),
  );

  return (
    <div className="flex flex-col h-screen">
      <Header
        classname="min-h-6"
        onShowData={() => panelRef.current?.resize("35%")}
        hideShowDataButton={!isCollapsed}
      />
      <main className="flex-1 flex justify-center items-center">
        <ResizablePanelGroup orientation="vertical">
          <ResizablePanel>
            <Outlet />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel
            panelRef={panelRef}
            collapsible
            defaultSize={0}
            onResize={(size) => {
              setIsCollapsed(size.inPixels < 100);
            }}
          >
            <ResultsTable />
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  );
};
