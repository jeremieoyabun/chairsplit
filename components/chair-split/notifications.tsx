"use client"

import { useState } from "react"
import { ArrowLeft, Check, Clock, UserPlus, X, DollarSign, Bell } from "lucide-react"

type Notification = {
  id: number
  icon: typeof Check
  iconBg: string
  title: string
  body: string
  time: string
  unread: boolean
}

const initialNotifications: Notification[] = [
  {
    id: 1,
    icon: Check,
    iconBg: "#16A34A",
    title: "Visit validated",
    body: "Karim B. \u2014 Haircut/Fade, Beard Trim \u2014 700 \u0E3F",
    time: "2 min ago",
    unread: true,
  },
  {
    id: 2,
    icon: Clock,
    iconBg: "#F59E0B",
    title: "Draft pending",
    body: "Alex M. \u2014 Hair Coloring \u2014 1,500 \u0E3F awaiting validation",
    time: "15 min ago",
    unread: true,
  },
  {
    id: 3,
    icon: UserPlus,
    iconBg: "#3B82F6",
    title: "New barber joined",
    body: "Youssef R. accepted the invitation and is now active",
    time: "1 hour ago",
    unread: true,
  },
  {
    id: 4,
    icon: X,
    iconBg: "#EF4444",
    title: "Visit cancelled",
    body: "Karim B. \u2014 Hair Coloring \u2014 1,500 \u0E3F was cancelled",
    time: "Yesterday",
    unread: false,
  },
  {
    id: 5,
    icon: DollarSign,
    iconBg: "#16A34A",
    title: "Payslip approved",
    body: "January payslip for Karim B. (18,900 \u0E3F) approved",
    time: "2 days ago",
    unread: false,
  },
]

export function Notifications({ onBack }: { onBack: () => void }) {
  const [notifications, setNotifications] = useState(initialNotifications)

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Top bar */}
      <div className="flex items-center px-5 pt-4 pb-3">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-[#FFFFFF] flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.06)] active:scale-95 transition-transform"
          aria-label="Go back"
        >
          <ArrowLeft className="w-[18px] h-[18px] text-[#111113]" />
        </button>
        <h1 className="flex-1 text-center text-[18px] font-semibold text-[#111113]">
          Notifications
        </h1>
        <button
          type="button"
          onClick={markAllRead}
          className="text-[13px] font-semibold text-[#3B82F6] active:opacity-60 transition-opacity whitespace-nowrap"
        >
          Mark all read
        </button>
      </div>

      {/* Notification list */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-5 mt-4 flex flex-col gap-2.5 pb-10">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`relative rounded-[16px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-4 ${
              !n.unread ? "opacity-60" : ""
            }`}
          >
            {/* Blue unread dot */}
            {n.unread && (
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#3B82F6]" />
            )}

            <div className="flex items-start gap-3 ml-3">
              {/* Icon circle */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: n.iconBg }}
              >
                <n.icon className="w-[16px] h-[16px] text-[#FFFFFF]" strokeWidth={2.5} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[15px] font-semibold text-[#111113] leading-tight">
                    {n.title}
                  </span>
                  <span className="text-[11px] text-[#D1D5DB] whitespace-nowrap shrink-0">
                    {n.time}
                  </span>
                </div>
                <span className="text-[13px] text-[#6B7280] leading-relaxed block mt-1">
                  {n.body}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
