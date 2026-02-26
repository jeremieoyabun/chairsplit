"use client"

import { BarChart3, Banknote, Users, CalendarDays } from "lucide-react"

const actions = [
  { icon: BarChart3, label: "Reports", bg: "#DBEAFE" },
  { icon: Banknote, label: "Payouts", bg: "#D1FAE5" },
  { icon: Users, label: "Clients", bg: "#FEF3C7" },
  { icon: CalendarDays, label: "Agenda", bg: "#EDE9FE" },
]

export function QuickActions({
  onReportsPress,
  onPayoutsPress,
  onClientsPress,
  onAgendaPress,
}: {
  onReportsPress?: () => void
  onPayoutsPress?: () => void
  onClientsPress?: () => void
  onAgendaPress?: () => void
}) {
  const handlers = [onReportsPress, onPayoutsPress, onClientsPress, onAgendaPress]

  return (
    <div className="flex items-start justify-center gap-5 px-5 mt-6">
      {actions.map((action, i) => (
        <button
          key={action.label}
          type="button"
          onClick={handlers[i]}
          className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
        >
          <div
            className="w-[68px] h-[68px] rounded-[20px] flex items-center justify-center"
            style={{ backgroundColor: action.bg }}
          >
            <action.icon className="w-[28px] h-[28px] text-[#374151]" strokeWidth={1.7} />
          </div>
          <span className="text-[12px] font-medium text-[#6B7280]">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  )
}
