"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { UserRole } from "@/lib/types"
import { PhoneFrame } from "@/components/chair-split/phone-frame"
import { Header } from "@/components/chair-split/header"
import { RevenueCard } from "@/components/chair-split/revenue-card"
import { QuickActions } from "@/components/chair-split/quick-actions"
import { RecentVisits } from "@/components/chair-split/recent-visits"
import { BottomNav } from "@/components/chair-split/bottom-nav"
import { NewVisit } from "@/components/chair-split/new-visit"
import { VisitDetail } from "@/components/chair-split/visit-detail"
import { History } from "@/components/chair-split/history"
import { Team } from "@/components/chair-split/team"
import { BarberDetail } from "@/components/chair-split/barber-detail"
import { Accounting } from "@/components/chair-split/accounting"
import { Expenses } from "@/components/chair-split/expenses"
import { Statements } from "@/components/chair-split/statements"
import { Payslips } from "@/components/chair-split/payslips"
import { Login } from "@/components/chair-split/login"
import { Signup } from "@/components/chair-split/signup"
import { RoleSelect } from "@/components/chair-split/role-select"
import { Services } from "@/components/chair-split/services"
import { Commissions } from "@/components/chair-split/commissions"
import { Clients } from "@/components/chair-split/clients"
import { Subscription } from "@/components/chair-split/subscription"
import { ShopProfile } from "@/components/chair-split/shop-profile"
import { Notifications } from "@/components/chair-split/notifications"
import { Profile } from "@/components/chair-split/profile"
import { AddBarber } from "@/components/chair-split/add-barber"
import { ServiceCatalog } from "@/components/chair-split/service-catalog"
import { BarberHome } from "@/components/chair-split/barber-home"
import { BarberNewVisit } from "@/components/chair-split/barber-new-visit"
import { BarberHistory } from "@/components/chair-split/barber-history"
import { BarberStats } from "@/components/chair-split/barber-stats"
import { BarberSettings } from "@/components/chair-split/barber-settings"
import { BarberBottomNav } from "@/components/chair-split/barber-bottom-nav"
import { SetupShop } from "@/components/chair-split/setup-shop"
import { Agenda } from "@/components/chair-split/agenda"

type Screen =
  | "login" | "signup" | "role-select" | "setup-shop"
  | "home" | "notifications" | "profile"
  | "new-visit" | "visit-detail" | "visit-draft"
  | "history"
  | "team" | "barber-detail" | "add-barber"
  | "accounting" | "expenses" | "statements" | "payslips"
  | "settings" | "service-catalog" | "commissions" | "clients" | "subscription" | "shop-profile"
  | "agenda"
  | "barber-home" | "barber-new-visit" | "barber-history" | "barber-stats" | "barber-settings"

type Notification = { type: "success" | "info" | "error"; message: string }

export default function Page() {
  const [screen, setScreen] = useState<Screen>("login")
  const [notification, setNotification] = useState<Notification | null>(null)

  // Auto-dismiss notification
  useEffect(() => {
    if (!notification) return
    const t = setTimeout(() => setNotification(null), 4000)
    return () => clearTimeout(t)
  }, [notification])

  // Handle URL params from Stripe / Google OAuth returns
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const stripe = params.get("stripe")
    const google = params.get("google")
    if (stripe === "success") setNotification({ type: "success", message: "Subscription activated!" })
    else if (stripe === "canceled") setNotification({ type: "info", message: "Checkout canceled." })
    else if (google === "connected") setNotification({ type: "success", message: "Google Calendar connected!" })
    else if (google === "error") setNotification({ type: "error", message: "Could not connect Google Calendar." })
    if (stripe || google) window.history.replaceState({}, "", "/")
  }, [])

  // Restore session on mount — if already logged in, skip login screen
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, shop_id")
        .eq("id", user.id)
        .single()
      const role = (profile?.role as UserRole) ?? "barber"
      if (role === "barber") { setScreen("barber-home"); return }
      setScreen(profile?.shop_id ? "home" : "setup-shop")
    })
  }, [])

  const handleLogin = (role: UserRole, shopId: string | null) => {
    if (role === "barber") { setScreen("barber-home"); return }
    setScreen(shopId ? "home" : "setup-shop")
  }

  const handleSignOut = async () => {
    await createClient().auth.signOut()
    setScreen("login")
  }

  // Owner bottom nav
  const handleTabChange = (index: number) => {
    if (index === 0) setScreen("home")
    else if (index === 1) setScreen("history")
    else if (index === 2) setScreen("team")
    else if (index === 3) setScreen("accounting")
  }

  const activeTab =
    screen === "history" ? 1 :
    screen === "team" || screen === "add-barber" ? 2 :
    screen === "accounting" || screen === "expenses" || screen === "statements" || screen === "payslips" ? 3 :
    0

  const navProps = {
    activeTab,
    onTabChange: handleTabChange,
    onPlusPress: () => setScreen("new-visit"),
  }

  // Barber bottom nav
  const handleBarberTabChange = (index: number) => {
    if (index === 0) setScreen("barber-home")
    else if (index === 1) setScreen("barber-history")
    else if (index === 2) setScreen("barber-stats")
    else if (index === 3) setScreen("barber-settings")
  }

  const barberActiveTab =
    screen === "barber-history" ? 1 :
    screen === "barber-stats" ? 2 :
    screen === "barber-settings" ? 3 :
    0

  const barberNavProps = {
    activeTab: barberActiveTab,
    onTabChange: handleBarberTabChange,
    onPlusPress: () => setScreen("barber-new-visit"),
  }

  return (
    <PhoneFrame>
      {/* URL-param notification toast */}
      {notification && (
        <div
          className={`absolute top-4 left-4 right-4 z-[100] rounded-[14px] px-4 py-3 shadow-lg flex items-center gap-2 transition-all ${
            notification.type === "success"
              ? "bg-[#ECFDF5] border border-[#BBF7D0]"
              : notification.type === "error"
              ? "bg-[#FEF2F2] border border-[#FECACA]"
              : "bg-[#EFF6FF] border border-[#BFDBFE]"
          }`}
          style={{ animation: "none" }}
        >
          <span
            className={`text-[13px] font-semibold flex-1 ${
              notification.type === "success"
                ? "text-[#16A34A]"
                : notification.type === "error"
                ? "text-[#DC2626]"
                : "text-[#2563EB]"
            }`}
          >
            {notification.message}
          </span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-[#9CA3AF] text-[16px] leading-none"
          >
            ×
          </button>
        </div>
      )}

      {screen === "login" ? (
        <Login
          onLogin={handleLogin}
          onSignupPress={() => setScreen("signup")}
        />
      ) : screen === "signup" ? (
        <Signup
          onSignup={() => setScreen("role-select")}
          onLoginPress={() => setScreen("login")}
        />
      ) : screen === "role-select" ? (
        <RoleSelect onSelect={(role) => {
          if (role === "barber") setScreen("barber-home")
          else setScreen("setup-shop")
        }} />
      ) : screen === "setup-shop" ? (
        <SetupShop onComplete={() => setScreen("home")} />
      ) : screen === "home" ? (
        <>
          <Header
            onSettingsPress={() => setScreen("settings")}
            onNotificationsPress={() => setScreen("notifications")}
          />
          <RevenueCard />
          <QuickActions
            onReportsPress={() => setScreen("statements")}
            onPayoutsPress={() => setScreen("payslips")}
            onClientsPress={() => setScreen("clients")}
            onAgendaPress={() => setScreen("agenda")}
          />
          <RecentVisits
            onVisitPress={() => setScreen("visit-detail")}
            onDraftPress={() => setScreen("visit-draft")}
            onViewAllPress={() => setScreen("history")}
          />
          <BottomNav {...navProps} />
        </>
      ) : screen === "notifications" ? (
        <Notifications onBack={() => setScreen("home")} />
      ) : screen === "profile" ? (
        <Profile onBack={() => setScreen("home")} />
      ) : screen === "history" ? (
        <>
          <History onVisitPress={() => setScreen("visit-detail")} />
          <BottomNav {...navProps} />
        </>
      ) : screen === "team" ? (
        <>
          <Team
            onBarberPress={() => setScreen("barber-detail")}
            onAddBarberPress={() => setScreen("add-barber")}
          />
          <BottomNav {...navProps} />
        </>
      ) : screen === "accounting" ? (
        <>
          <Accounting
            onExpensesPress={() => setScreen("expenses")}
            onStatementsPress={() => setScreen("statements")}
            onPayslipsPress={() => setScreen("payslips")}
          />
          <BottomNav {...navProps} />
        </>
      ) : screen === "add-barber" ? (
        <AddBarber
          onBack={() => setScreen("team")}
          onUpgradePress={() => setScreen("subscription")}
        />
      ) : screen === "settings" ? (
        <Services
          onBack={() => setScreen("home")}
          onServiceCatalogPress={() => setScreen("service-catalog")}
          onCommissionsPress={() => setScreen("commissions")}
          onClientsPress={() => setScreen("clients")}
          onSubscriptionPress={() => setScreen("subscription")}
          onShopProfilePress={() => setScreen("shop-profile")}
          onProfilePress={() => setScreen("profile")}
          onSignOut={handleSignOut}
        />
      ) : screen === "service-catalog" ? (
        <ServiceCatalog onBack={() => setScreen("settings")} />
      ) : screen === "commissions" ? (
        <Commissions onBack={() => setScreen("settings")} />
      ) : screen === "clients" ? (
        <Clients onBack={() => setScreen("settings")} />
      ) : screen === "subscription" ? (
        <Subscription onBack={() => setScreen("settings")} />
      ) : screen === "shop-profile" ? (
        <ShopProfile onBack={() => setScreen("settings")} />
      ) : screen === "statements" ? (
        <Statements onBack={() => setScreen("accounting")} />
      ) : screen === "payslips" ? (
        <Payslips onBack={() => setScreen("accounting")} />
      ) : screen === "expenses" ? (
        <Expenses onBack={() => setScreen("accounting")} />
      ) : screen === "barber-detail" ? (
        <BarberDetail onBack={() => setScreen("team")} />
      ) : screen === "new-visit" ? (
        <NewVisit onBack={() => setScreen("home")} />
      ) : screen === "visit-detail" ? (
        <VisitDetail onBack={() => setScreen("home")} status="validated" />
      ) : screen === "agenda" ? (
        <Agenda onBack={() => setScreen("home")} />

      /* ── Barber Interface ── */
      ) : screen === "barber-home" ? (
        <>
          <BarberHome
            onSettingsPress={() => setScreen("barber-settings")}
            onNewVisitPress={() => setScreen("barber-new-visit")}
            onViewAllPress={() => setScreen("barber-history")}
          />
          <BarberBottomNav {...barberNavProps} />
        </>
      ) : screen === "barber-new-visit" ? (
        <BarberNewVisit onBack={() => setScreen("barber-home")} />
      ) : screen === "barber-history" ? (
        <>
          <BarberHistory />
          <BarberBottomNav {...barberNavProps} />
        </>
      ) : screen === "barber-stats" ? (
        <>
          <BarberStats />
          <BarberBottomNav {...barberNavProps} />
        </>
      ) : screen === "barber-settings" ? (
        <BarberSettings
          onBack={() => setScreen("barber-home")}
          onSignOut={handleSignOut}
        />
      ) : (
        <VisitDetail onBack={() => setScreen("home")} status="draft" />
      )}
    </PhoneFrame>
  )
}
