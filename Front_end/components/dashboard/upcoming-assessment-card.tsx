import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function UpcomingAssessmentCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Assessment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-3">
          <div
            aria-hidden
            className="h-10 w-10 rounded-full bg-primary text-primary-foreground grid place-items-center font-semibold"
          >
            L
          </div>
          <div>
            <div className="font-medium">Mathematics II - Calculus</div>
            <div className="text-sm text-muted-foreground">Due: Oct 26, 2023</div>
          </div>
        </div>
        <div className="text-sm">
          Strengths: Algebra, Geometry
          <br />
          Weaknesses: Probability, Statistics
        </div>
      </CardContent>
    </Card>
  )
}
