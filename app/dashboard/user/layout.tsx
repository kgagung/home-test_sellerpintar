import UserLayoutWrapper from "@/components/userWrapper";
import { ReactNode } from "react";

export default function UserLayout({ children }: { children: ReactNode }) {
  return <UserLayoutWrapper>{children}</UserLayoutWrapper>;
}
