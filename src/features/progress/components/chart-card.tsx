import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * RN-PR-06: cada gráfico de "Mis datos" lleva su título y su frase explicativa del catálogo. Los gráficos de recharts
 * necesitan un alto fijo; `fluid` lo quita para los que se miden solos (el mapa "Mi día").
 */
export function ChartCard({
  title,
  explanation,
  fluid = false,
  children,
}: {
  title: string;
  explanation: string;
  fluid?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{explanation}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={cn("w-full", !fluid && "h-52")}>{children}</div>
      </CardContent>
    </Card>
  );
}
