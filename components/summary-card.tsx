import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SummaryCard({
  label,
  value,
  helper
}: {
  label: string;
  value: string | number;
  helper?: string;
}) {
  return (
    <Card className="grain">
      <CardHeader className="pb-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
      {helper ? <CardContent className="pt-0 text-sm text-muted-foreground">{helper}</CardContent> : null}
    </Card>
  );
}
