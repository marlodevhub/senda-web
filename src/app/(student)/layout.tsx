import { BottomNav } from "@/components/layout/bottom-nav";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="mx-auto w-full max-w-md px-4 py-6">{children}</main>
      <BottomNav />
    </div>
  );
}
