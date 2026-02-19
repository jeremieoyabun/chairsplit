"use client"

import type { ReactNode } from "react"

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#E8E8EC] p-4">
      <div className="relative w-[375px] h-[812px] rounded-[44px] bg-[#111113] p-[3px] shadow-2xl">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[28px] bg-[#111113] rounded-b-2xl z-30" />
        {/* Screen */}
        <div className="relative w-full h-full rounded-[42px] overflow-hidden bg-[#F0F0F3]">
          {/* Status bar */}
          <div className="relative z-20 flex items-center justify-between px-8 pt-4 pb-1 bg-[#F0F0F3]">
            <span className="text-[13px] font-semibold text-[#111113]">9:41</span>
            <div className="flex items-center gap-1.5">
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                <rect x="0" y="5" width="3" height="7" rx="1" fill="#111113" />
                <rect x="4.5" y="3.5" width="3" height="8.5" rx="1" fill="#111113" />
                <rect x="9" y="1.5" width="3" height="10.5" rx="1" fill="#111113" />
                <rect x="13.5" y="0" width="3" height="12" rx="1" fill="#111113" />
              </svg>
              <svg width="15" height="12" viewBox="0 0 15 12" fill="none">
                <path d="M7.5 3.5C9.16 3.5 10.67 4.16 11.78 5.22L13.2 3.8C11.73 2.36 9.72 1.5 7.5 1.5C5.28 1.5 3.27 2.36 1.8 3.8L3.22 5.22C4.33 4.16 5.84 3.5 7.5 3.5Z" fill="#111113" />
                <path d="M7.5 6.5C8.6 6.5 9.59 6.93 10.34 7.63L11.78 6.22C10.67 5.16 9.16 4.5 7.5 4.5C5.84 4.5 4.33 5.16 3.22 6.22L4.66 7.63C5.41 6.93 6.4 6.5 7.5 6.5Z" fill="#111113" />
                <circle cx="7.5" cy="10" r="1.5" fill="#111113" />
              </svg>
              <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
                <rect x="0" y="1" width="21" height="10" rx="2" stroke="#111113" strokeWidth="1" />
                <rect x="1.5" y="2.5" width="17" height="7" rx="1" fill="#111113" />
                <rect x="22" y="4" width="2" height="4" rx="1" fill="#111113" />
              </svg>
            </div>
          </div>
          {/* Content */}
          <div className="h-[calc(100%-40px)] overflow-y-auto overflow-x-hidden pb-24 scrollbar-hide">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
