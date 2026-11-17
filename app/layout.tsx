import type { ReactNode } from "react";
import "./style.css";
export const metadata = { title: "UNITEN Club Master Calendar", description: "University club events and SRC-supervised scheduling" };
export default function RootLayout({ children }: { children: ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
