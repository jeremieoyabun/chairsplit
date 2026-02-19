"use client"

import { Plus } from "lucide-react"

function TodayIcon({ color }: { color: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 377.44 436.58" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path d="M105.93,118.27c-12.66,0-22.93-10.26-22.93-22.93V22.93c0-12.68,10.27-22.93,22.93-22.93s22.93,10.26,22.93,22.93v72.41c0,12.68-10.27,22.93-22.93,22.93Z"/>
      <path d="M271.51,118.27c-12.66,0-22.93-10.26-22.93-22.93V22.93c0-12.68,10.27-22.93,22.93-22.93s22.93,10.26,22.93,22.93v72.41c0,12.68-10.27,22.93-22.93,22.93Z"/>
      <path d="M340.91,59.14h-23.53v36.2c0,25.29-20.58,45.87-45.87,45.87s-45.87-20.57-45.87-45.87v-36.2h-73.85v36.2c0,25.29-20.58,45.87-45.87,45.87s-45.87-20.57-45.87-45.87v-36.2h-23.52C16.36,59.14,0,75.5,0,95.67v75.9h377.44v-75.9c0-20.18-16.36-36.54-36.54-36.54Z"/>
      <path d="M0,205.97v194.07c0,20.18,16.36,36.54,36.54,36.54h304.37c20.18,0,36.54-16.36,36.54-36.54v-194.07H0ZM120.3,381.29c0,6.77-5.49,12.26-12.26,12.26h-31.72c-6.77,0-12.26-5.49-12.26-12.26v-31.72c0-6.77,5.49-12.26,12.26-12.26h31.72c6.77,0,12.26,5.49,12.26,12.26v31.72ZM120.3,294.86c0,6.77-5.49,12.26-12.26,12.26h-31.72c-6.77,0-12.26-5.49-12.26-12.26v-31.72c0-6.77,5.49-12.26,12.26-12.26h31.72c6.77,0,12.26,5.49,12.26,12.26v31.72ZM216.84,381.29c0,6.77-5.49,12.26-12.26,12.26h-31.72c-6.77,0-12.26-5.49-12.26-12.26v-31.72c0-6.77,5.49-12.26,12.26-12.26h31.72c6.77,0,12.26,5.49,12.26,12.26v31.72ZM216.84,294.86c0,6.77-5.49,12.26-12.26,12.26h-31.72c-6.77,0-12.26-5.49-12.26-12.26v-31.72c0-6.77,5.49-12.26,12.26-12.26h31.72c6.77,0,12.26,5.49,12.26,12.26v31.72ZM313.39,381.29c0,6.77-5.49,12.26-12.26,12.26h-31.72c-6.77,0-12.26-5.49-12.26-12.26v-31.72c0-6.77,5.49-12.26,12.26-12.26h31.72c6.77,0,12.26,5.49,12.26,12.26v31.72ZM313.39,294.86c0,6.77-5.49,12.26-12.26,12.26h-31.72c-6.77,0-12.26-5.49-12.26-12.26v-31.72c0-6.77,5.49-12.26,12.26-12.26h31.72c6.77,0,12.26,5.49,12.26,12.26v31.72Z"/>
    </svg>
  )
}

function HistoryIcon({ color }: { color: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 499.29 499.29" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path d="M249.64,0C111.77,0,0,111.77,0,249.64s111.77,249.64,249.64,249.64,249.64-111.77,249.64-249.64S387.52,0,249.64,0ZM383.26,322.81c-5.05,9.23-14.58,14.45-24.41,14.45-4.51,0-9.08-1.09-13.32-3.42l-109.23-59.79c-8.92-4.86-14.46-14.23-14.46-24.38v-126.13c0-15.37,12.45-27.81,27.81-27.81s27.81,12.44,27.81,27.81v109.65l94.77,51.89c13.48,7.36,18.42,24.28,11.04,37.74h0Z"/>
    </svg>
  )
}

function StatsIcon({ color }: { color: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 377.44 499.29" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path d="M370.38,83.64L293.81,7.06c-4.52-4.52-10.65-7.06-17.05-7.06H24.11C10.8,0,0,10.8,0,24.11v451.07c0,13.32,10.8,24.11,24.11,24.11h329.22c13.32,0,24.11-10.8,24.11-24.11V100.68c0-6.4-2.54-12.53-7.06-17.05h0ZM83.36,107.43h163.99c12.53,0,22.66,10.14,22.66,22.66s-10.14,22.66-22.66,22.66H83.36c-12.53,0-22.66-10.14-22.66-22.66s10.14-22.66,22.66-22.66ZM307.81,411.11h-93.43c-12.53,0-22.66-10.14-22.66-22.66s10.14-22.66,22.66-22.66h93.43c12.53,0,22.66,10.14,22.66,22.66s-10.14,22.66-22.66,22.66ZM307.81,324.97H83.36c-12.53,0-22.66-10.14-22.66-22.66s10.14-22.66,22.66-22.66h224.45c12.53,0,22.66,10.14,22.66,22.66s-10.14,22.66-22.66,22.66ZM307.81,238.86H83.36c-12.53,0-22.66-10.14-22.66-22.66s10.14-22.66,22.66-22.66h224.45c12.53,0,22.66,10.14,22.66,22.66s-10.14,22.66-22.66,22.66Z"/>
    </svg>
  )
}

const leftTabs = [
  { Icon: TodayIcon, label: "Today", index: 0 },
  { Icon: HistoryIcon, label: "History", index: 1 },
]

const rightTabs = [
  { Icon: StatsIcon, label: "My Stats", index: 2 },
]

export function BarberBottomNav({
  activeTab = 0,
  onTabChange,
  onPlusPress,
}: {
  activeTab?: number
  onTabChange?: (index: number) => void
  onPlusPress?: () => void
}) {
  return (
    <div className="absolute bottom-3 left-4 right-4 z-30">
      {/* Center "+" button */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-[26px] z-10">
        <button
          type="button"
          onClick={onPlusPress}
          className="w-[60px] h-[60px] rounded-full bg-[#1A1A1A] flex items-center justify-center shadow-[0_6px_20px_rgba(0,0,0,0.25)] ring-[4px] ring-[#F0F0F3] active:scale-95 transition-transform"
          aria-label="New visit"
        >
          <Plus className="w-[26px] h-[26px] text-[#FFFFFF]" strokeWidth={2.5} />
        </button>
      </div>

      <div className="bg-[#1A1A1A] rounded-[28px] h-[64px] flex items-center px-4 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
        {/* Left tabs */}
        <div className="flex-1 flex items-center justify-around">
          {leftTabs.map((tab) => {
            const isActive = tab.index === activeTab
            const color = isActive ? "#FFFFFF" : "#6B7280"
            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => onTabChange?.(tab.index)}
                className="flex flex-col items-center justify-center w-14 transition-all duration-200"
                aria-label={tab.label}
              >
                <tab.Icon color={color} />
                {isActive && (
                  <span className="text-[9px] font-medium text-[#FFFFFF] mt-[4px] whitespace-nowrap">
                    {tab.label}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Spacer for center button */}
        <div className="w-[68px]" />

        {/* Right tab */}
        <div className="flex-1 flex items-center justify-around">
          {rightTabs.map((tab) => {
            const isActive = tab.index === activeTab
            const color = isActive ? "#FFFFFF" : "#6B7280"
            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => onTabChange?.(tab.index)}
                className="flex flex-col items-center justify-center w-14 transition-all duration-200"
                aria-label={tab.label}
              >
                <tab.Icon color={color} />
                {isActive && (
                  <span className="text-[9px] font-medium text-[#FFFFFF] mt-[4px] whitespace-nowrap">
                    {tab.label}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
