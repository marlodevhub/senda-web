import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/** RN-PR-06: cada gráfico de "Mis datos" lleva su título y su frase explicativa del catálogo. */
export function ChartCard({
  title,
  explanation,
  children,
}: {
  title: string;
  explanation: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{explanation}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-52 w-full">{children}</div>
      </CardContent>
    </Card>
  );
}
