import { FC } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";

export const Layout: FC = () => {
  return (
    <div className="flex flex-col">
      <Header classname="min-h-6"/>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};
