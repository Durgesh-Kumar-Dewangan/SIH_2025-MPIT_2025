import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function RecentResults() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Calculus II Quiz</span>
          <span className="font-medium">92% - A</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>Chemistry Final</span>
          <span className="font-medium">88% - A-</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>Physics Lab Report</span>
          <span className="font-medium">78% - B+</span>
        </div>
        <div className="pt-2 text-sm text-muted-foreground">View Details</div>
      </CardContent>
    </Card>
  )
}
