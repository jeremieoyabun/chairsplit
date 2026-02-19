"use client"

type Barber = {
  initials: string
  name: string
  visits: string
  ca: string
  commission: string
  color: string
  caNum: number
}

const totalCa = 5800

const barbers: Barber[] = [
  { initials: "KB", name: "Karim B.", visits: "3 visits", ca: "2 050", commission: "615", color: "#3B82F6", caNum: 2050 },
  { initials: "AM", name: "Alex M.", visits: "2 visits", ca: "2 800", commission: "700", color: "#16A34A", caNum: 2800 },
  { initials: "YR", name: "Youssef R.", visits: "2 visits", ca: "950", commission: "285", color: "#F59E0B", caNum: 950 },
]

export function Team({
  onBarberPress,
  onAddBarberPress,
}: {
  onBarberPress?: () => void
  onAddBarberPress?: () => void
}) {
  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-2">
        <h1 className="text-[28px] font-bold text-[#111113] leading-tight">
          Team
        </h1>
        <button
          type="button"
          onClick={onAddBarberPress}
          className="text-[14px] font-semibold text-[#2563EB]"
        >
          + Add barber
        </button>
      </div>

      {/* Dark KPI Banner */}
      <div className="mx-5 mt-2">
        <div className="rounded-[20px] bg-[#1A1A1A] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          <div className="flex">
            <div className="flex-1 flex flex-col items-center justify-center">
              <span className="text-[26px] font-bold text-[#FFFFFF] leading-none">
                3
              </span>
              <span className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#6B7280] mt-1.5 text-center">
                active barbers
              </span>
            </div>
            <div className="w-px bg-[rgba(255,255,255,0.08)] my-1" />
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="flex items-baseline whitespace-nowrap">
                <span className="text-[26px] font-bold text-[#FFFFFF] leading-none">
                  5 800
                </span>
                <span className="text-[14px] text-[#6B7280] ml-0.5">
                  {"\u0E3F"}
                </span>
              </div>
              <span className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#6B7280] mt-1.5 text-center">
                {"today\u2019s revenue"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Barber Cards */}
      <div className="px-5 mt-6 flex flex-col gap-3">
        {barbers.map((barber) => {
          const pct = Math.round((barber.caNum / totalCa) * 100)
          return (
            <div
              key={barber.initials}
              onClick={onBarberPress}
              className="rounded-[20px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 cursor-pointer active:scale-[0.99] transition-transform"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: barber.color }}
                >
                  <span className="text-[15px] font-semibold text-[#FFFFFF]">
                    {barber.initials}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[17px] font-semibold text-[#111113] block leading-tight">
                    {barber.name}
                  </span>
                  <span className="text-[13px] text-[#9CA3AF] block mt-0.5">
                    {barber.visits}
                  </span>
                </div>
              </div>

              <div className="flex items-end mt-3.5">
                <div className="flex-1">
                  <span className="text-[11px] text-[#9CA3AF] block">Revenue</span>
                  <div className="flex items-baseline mt-0.5">
                    <span className="text-[16px] font-semibold text-[#111113]">
                      {barber.ca}
                    </span>
                    <span className="text-[12px] text-[#9CA3AF] ml-0.5">
                      {"\u0E3F"}
                    </span>
                  </div>
                </div>

                <div className="flex-1">
                  <span className="text-[11px] text-[#9CA3AF] block">Commission</span>
                  <div className="flex items-baseline mt-0.5">
                    <span className="text-[16px] font-semibold text-[#16A34A]">
                      {barber.commission}
                    </span>
                    <span className="text-[12px] text-[#16A34A] ml-0.5">
                      {"\u0E3F"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-[60px] h-1 rounded-full bg-[#F3F4F6] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: barber.color }}
                    />
                  </div>
                  <span className="text-[11px] text-[#9CA3AF] tabular-nums">
                    {pct}%
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Inactive Section */}
      <div className="px-5 mt-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF]">
            Inactive
          </span>
          <span className="text-[11px] font-semibold text-[#6B7280] bg-[#F3F4F6] rounded-full px-2 py-0.5 leading-none">
            1
          </span>
        </div>

        <div className="rounded-[20px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 opacity-35">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-[#9CA3AF]">
              <span className="text-[15px] font-semibold text-[#FFFFFF]">
                ML
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[17px] font-semibold text-[#111113] block leading-tight">
                Marco L.
              </span>
              <span className="text-[13px] text-[#9CA3AF] block mt-0.5">
                Inactive since Feb 2026
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
