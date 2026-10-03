import { Card, CardContent } from "@/components/ui/card";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-grad-dawn-soft px-4 py-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <h1 className="text-center font-heading text-2xl font-extrabold text-foreground">Senda</h1>
        <Card>
          <CardContent className="pt-2">{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}
