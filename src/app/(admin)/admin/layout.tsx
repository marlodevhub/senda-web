import type { Metadata } from "next";

// RS-AD-04: el panel de administración nunca se indexa.
export const metadata: Metadata = {
  robots: "noindex, nofollow",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
