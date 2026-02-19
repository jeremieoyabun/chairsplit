"use client"

type Visit = {
  initials: string
  name: string
  services: string
  amount: string
  time: string
  color: string
  status: "validated" | "draft" | "cancelled"
}

const visits: Visit[] = [
  {
    initials: "KB",
    name: "Karim B.",
    services: "Haircut/Fade, Beard Trim",
    amount: "700",
    time: "09:15",
    color: "#3B82F6",
    status: "validated",
  },
  {
    initials: "AM",
    name: "Ali M.",
    services: "Hair Coloring",
    amount: "1 500",
    time: "10:00",
    color: "#16A34A",
    status: "validated",
  },
  {
    initials: "YR",
    name: "Youssef R.",
    services: "Bald Head Shave, Hot Towel",
    amount: "550",
    time: "10:45",
    color: "#F59E0B",
    status: "validated",
  },
  {
    initials: "KB",
    name: "Karim B.",
    services: "Haircut/Fade, Shampoo",
    amount: "700",
    time: "11:30",
    color: "#3B82F6",
    status: "draft",
  },
  {
    initials: "AM",
    name: "Ali M.",
    services: "Beard Coloring, Beard Trim",
    amount: "1 300",
    time: "13:00",
    color: "#16A34A",
    status: "validated",
  },
  {
    initials: "YR",
    name: "Youssef R.",
    services: "Haircut/Fade",
    amount: "400",
    time: "14:15",
    color: "#F59E0B",
    status: "validated",
  },
  {
    initials: "KB",
    name: "Karim B.",
    services: "Facial Steamer, Face Mask",
    amount: "500",
    time: "15:00",
    color: "#3B82F6",
    status: "cancelled",
  },
]

const statusConfig = {
  validated: { label: "Validated", bg: "#ECFDF5", text: "#16A34A" },
  draft: { label: "Draft", bg: "#FFFBEB", text: "#D97706" },
  cancelled: { label: "Cancelled", bg: "#FEF2F2", text: "#DC2626" },
}

export function RecentVisits({
  onVisitPress,
  onDraftPress,
  onViewAllPress,
}: {
  onVisitPress?: () => void
  onDraftPress?: () => void
  onViewAllPress?: () => void
}) {
  return (
    <div className="px-5 mt-8">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-[18px] font-semibold text-[#111113]">
          {"Today\u2019s Visits"}
        </h2>
        <button
          type="button"
          onClick={onViewAllPress}
          className="text-[13px] font-semibold text-[#2563EB]"
        >
          {"View all \u2192"}
        </button>
      </div>

      {/* Visit cards */}
      <div className="flex flex-col gap-2.5">
        {visits.map((visit, i) => {
          const badge = statusConfig[visit.status]
          return (
            <div
              key={`${visit.initials}-${visit.time}-${i}`}
              onClick={visit.status === "draft" ? onDraftPress : onVisitPress}
              className="flex items-center gap-3 rounded-[16px] bg-[#FFFFFF] px-4 py-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] w-full text-left active:scale-[0.99] transition-transform cursor-pointer"
            >
              {/* Colored avatar */}
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: visit.color }}
              >
                <span className="text-[14px] font-semibold text-[#FFFFFF]">
                  {visit.initials}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <span className="text-[15px] font-semibold text-[#111113] leading-tight block">
                  {visit.name}
                </span>
                <span className="text-[13px] text-[#9CA3AF] block truncate mt-0.5">
                  {visit.services}
                </span>
              </div>

              {/* Right side: amount + time + badge */}
              <div className="text-right shrink-0 flex flex-col items-end">
                <div className="flex items-baseline justify-end">
                  <span className="text-[17px] font-bold text-[#111113] leading-tight">
                    {visit.amount}
                  </span>
                  <span className="text-[13px] text-[#9CA3AF] ml-0.5">
                    {"\u0E3F"}
                  </span>
                </div>
                <span className="text-[11px] text-[#D1D5DB] block mt-0.5">
                  {visit.time}
                </span>
                <span
                  className="text-[9px] font-semibold px-2 py-0.5 rounded-full mt-1 leading-none"
                  style={{ backgroundColor: badge.bg, color: badge.text }}
                >
                  {badge.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
