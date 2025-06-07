import type { PropsWithChildren } from "react";
import { Content } from "../Content";
import { LeftMenu } from "../Menu/LeftMenu";
import { TopMenu } from "./TopMenu";

export async function AppLayout({
  children,
  query,
}: PropsWithChildren<{ query?: string }>) {
  return (
    <>
      <LeftMenu />
      <Content>
        <TopMenu query={query} />
        {children}
      </Content>
    </>
  );
}
