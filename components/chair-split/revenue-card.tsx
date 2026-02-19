"use client"

const miniKpis = [
  { label: "VISITS", value: "7" },
  { label: "COMMISSIONS", value: "2 900", hasBaht: true },
  { label: "AVG.TICKET", value: "829", hasBaht: true },
]

export function RevenueCard() {
  return (
    <div className="mx-5 mt-4">
      <div className="rounded-[24px] bg-[#1A1A1A] px-4 py-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
        {/* Top row */}
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF]">
            {"TODAY\u2019S REVENUE"}
          </span>
          <span className="text-[12px] text-[#6B7280]">Feb 10, 2026</span>
        </div>

        {/* Main amount */}
        <div className="mt-2 flex items-baseline px-1">
          <span className="text-[48px] font-bold text-[#FFFFFF] leading-none tracking-tight">
            5 800
          </span>
          <span className="text-[28px] text-[#6B7280] ml-1.5 font-normal">
            {"\u0E3F"}
          </span>
        </div>

        {/* Mini KPI row — centered content, tighter gap */}
        <div className="mt-5 flex gap-2">
          {miniKpis.map((kpi) => (
            <div
              key={kpi.label}
              className="flex-1 rounded-[14px] bg-[rgba(255,255,255,0.06)] py-3.5 text-center"
            >
              <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[#6B7280] block">
                {kpi.label}
              </span>
              <div className="mt-1.5 flex items-baseline justify-center whitespace-nowrap">
                <span className="text-[22px] font-bold text-[#FFFFFF] leading-none">
                  {kpi.value}
                </span>
                {kpi.hasBaht && (
                  <span className="text-[14px] text-[#6B7280] ml-0.5">
                    {"\u0E3F"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
