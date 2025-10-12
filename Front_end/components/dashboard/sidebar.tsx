"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { BookOpen, BarChart3, LayoutDashboard, Settings } from "lucide-react"

export default function Sidebar({
  onStartExam,
  onShowDashboard,
}: {
  onStartExam: () => void
  onShowDashboard: () => void
}) {
  const path = usePathname()

  const Item = ({
    label,
    icon: Icon,
    onClick,
    active,
  }: {
    label: string
    icon: React.ComponentType<any>
    onClick?: () => void
    active?: boolean
  }) => (
    <button
      className={cn("w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-accent", active && "bg-accent")}
      onClick={onClick}
    >
      <Icon className="size-4" aria-hidden />
      <span>{label}</span>
    </button>
  )

  return (
    <div className="sticky top-0 h-dvh flex flex-col">
      <div className="px-4 py-3">
        <div className="text-lg font-semibold">Assessify</div>
        <div className="text-xs text-muted-foreground">Welcome, Alex</div>
      </div>
      <nav className="flex-1">
        <Item label="Dashboard" icon={LayoutDashboard} onClick={onShowDashboard} active />
        <Item label="Assessments" icon={BookOpen} />
        <Item label="Progress" icon={BarChart3} />
        <Item label="Settings" icon={Settings} />
      </nav>
      <div className="p-4">
        <Button className="w-full" onClick={onStartExam}>
          Start Exam
        </Button>
      </div>
    </div>
  )
}
