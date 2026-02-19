"use client"

import { BarChart3, Banknote, Users } from "lucide-react"

const actions = [
  { icon: BarChart3, label: "Reports", bg: "#DBEAFE" },
  { icon: Banknote, label: "Payouts", bg: "#D1FAE5" },
  { icon: Users, label: "Clients", bg: "#FEF3C7" },
]

export function QuickActions({
  onReportsPress,
  onPayoutsPress,
  onClientsPress,
}: {
  onReportsPress?: () => void
  onPayoutsPress?: () => void
  onClientsPress?: () => void
}) {
  const handlers = [onReportsPress, onPayoutsPress, onClientsPress]

  return (
    <div className="flex items-start justify-center gap-8 px-5 mt-6">
      {actions.map((action, i) => (
        <button
          key={action.label}
          type="button"
          onClick={handlers[i]}
          className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
        >
          <div
            className="w-[60px] h-[60px] rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: action.bg }}
          >
            <action.icon className="w-6 h-6 text-[#374151]" strokeWidth={1.8} />
          </div>
          <span className="text-[11px] font-medium text-[#6B7280]">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  )
}
