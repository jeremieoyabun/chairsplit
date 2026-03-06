"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { UserRole } from "@/lib/types"
import { clearShopCache } from "@/lib/get-shop"
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
import { ClientDetail } from "@/components/chair-split/client-detail"
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
import { ResetPassword } from "@/components/chair-split/reset-password"
import { Onboarding } from "@/components/chair-split/onboarding"

type Screen =
  | "login" | "signup" | "role-select" | "setup-shop" | "reset-password" | "onboarding"
  | "home" | "notifications" | "profile"
  | "new-visit" | "visit-detail" | "visit-draft"
  | "history"
  | "team" | "barber-detail" | "add-barber"
  | "accounting" | "expenses" | "statements" | "payslips"
  | "settings" | "service-catalog" | "commissions" | "clients" | "client-detail" | "subscription" | "shop-profile"
  | "agenda"
  | "barber-home" | "barber-new-visit" | "barber-history" | "barber-stats" | "barber-settings"

type Notification = { type: "success" | "info" | "error"; message: string }

export default function Page() {
  const [screen, setScreen] = useState<Screen>("login")
  const [notification, setNotification] = useState<Notification | null>(null)
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null)
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(null)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [pendingPlan, setPendingPlan] = useState<{ plan: string; billing: string } | null>(null)
  const [subscriptionReturnTo, setSubscriptionReturnTo] = useState<Screen>("settings")
  const [fromOnboarding, setFromOnboarding] = useState(false)
  const [visitReturnTo, setVisitReturnTo] = useState<Screen>("home")
  const [refreshKey, setRefreshKey] = useState(0)
  const handleRefresh = useCallback(() => {
    clearShopCache()
    setRefreshKey((k) => k + 1)
  }, [])

  // Auto-dismiss notification
  useEffect(() => {
    if (!notification) return
    const t = setTimeout(() => setNotification(null), 4000)
    return () => clearTimeout(t)
  }, [notification])

  // Handle URL params from Stripe / Google OAuth / password reset / plan pre-selection
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const stripe = params.get("stripe")
    const google = params.get("google")
    const reset = params.get("reset")
    const plan = params.get("plan")
    const billing = params.get("billing") ?? "monthly"
    if (stripe === "success") {
      fetch("/api/stripe/sync", { method: "POST" }).catch(() => {})
      setNotification({ type: "success", message: "Subscription activated!" })
    }
    else if (stripe === "canceled") setNotification({ type: "info", message: "Checkout canceled." })
    else if (google === "connected") setNotification({ type: "success", message: "Google Calendar connected!" })
    else if (google === "error") setNotification({ type: "error", message: "Could not connect Google Calendar." })
    else if (reset === "true") setScreen("reset-password")
    if (plan === "starter" || plan === "pro") setPendingPlan({ plan, billing })
    if (stripe || google || reset || plan) window.history.replaceState({}, "", "/")
  }, [])

  // Auto-trigger Stripe Checkout when user reaches home with a pre-selected plan
  useEffect(() => {
    if (screen !== "home" || !pendingPlan) return
    const { plan, billing } = pendingPlan
    setPendingPlan(null)
    fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, billing }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.url) window.location.href = json.url
        else setNotification({ type: "error", message: json.error ?? "Checkout unavailable" })
      })
      .catch(() => setNotification({ type: "error", message: "Checkout unavailable" }))
  }, [screen, pendingPlan])

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
      const role = profile?.role as UserRole | null
      const shopId = profile?.shop_id ?? null
      // No role = new user who hasn't completed onboarding yet
      // barber with no shop = was never properly invited, send to role-select
      if (!role || (role === "barber" && !shopId)) { setScreen("role-select"); return }
      if (role === "barber") { setScreen("barber-home"); return }
      // Check trial expiry for owners (fire-and-forget)
      if (shopId) fetch("/api/shop/expire-trial", { method: "POST" }).catch(() => {})
      setScreen(shopId ? "home" : "setup-shop")
    })
  }, [])

  const handleLogin = (role: UserRole | null, shopId: string | null) => {
    if (!role || (role === "barber" && !shopId)) { setScreen("role-select"); return }
    if (role === "barber") { setScreen("barber-home"); return }
    setScreen(shopId ? "home" : "setup-shop")
  }

  const handleSignOut = async () => {
    clearShopCache()
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
    <PhoneFrame onRefresh={handleRefresh}>
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

      <div key={refreshKey} className="contents">
      {screen === "login" ? (
        <Login
          onLogin={handleLogin}
          onSignupPress={() => setScreen("signup")}
        />
      ) : screen === "signup" ? (
        <Signup
          onSignup={() => setScreen("role-select")}
          onLoginPress={() => setScreen("login")}
          pendingPlan={pendingPlan?.plan}
        />
      ) : screen === "role-select" ? (
        <RoleSelect
          onSelect={(role) => {
            if (role === "barber") setScreen("barber-home")
            else setScreen("setup-shop")
          }}
          onBack={() => setScreen("signup")}
        />
      ) : screen === "setup-shop" ? (
        <SetupShop
          onComplete={() => {
            if (pendingPlan) { setScreen("home") } else { setScreen("onboarding") }
          }}
          onBack={() => setScreen("role-select")}
        />
      ) : screen === "reset-password" ? (
        <ResetPassword onComplete={() => {
          setNotification({ type: "success", message: "Password updated successfully!" })
          setScreen("login")
        }} />
      ) : screen === "onboarding" ? (
        <Onboarding
          onComplete={() => { setFromOnboarding(false); setScreen("home") }}
          onAddBarber={() => { setFromOnboarding(true); setScreen("add-barber") }}
          onCustomizeServices={() => { setFromOnboarding(true); setScreen("service-catalog") }}
          onLogVisit={() => { setFromOnboarding(true); setScreen("new-visit") }}
        />
      ) : screen === "home" ? (
        <>
          <Header
            onSettingsPress={() => setScreen("settings")}
            onNotificationsPress={() => setScreen("notifications")}
            onSubscriptionPress={() => { setSubscriptionReturnTo("home"); setScreen("subscription") }}
          />
          <RevenueCard />
          <QuickActions
            onReportsPress={() => setScreen("statements")}
            onPayoutsPress={() => setScreen("payslips")}
            onClientsPress={() => setScreen("clients")}
            onAgendaPress={() => setScreen("agenda")}
          />
          <RecentVisits
            onVisitPress={(id) => { setSelectedVisitId(id); setVisitReturnTo("home"); setScreen("visit-detail") }}
            onDraftPress={(id) => { setSelectedVisitId(id); setVisitReturnTo("home"); setScreen("visit-draft") }}
            onViewAllPress={() => setScreen("history")}
          />
          <BottomNav {...navProps} />
        </>
      ) : screen === "notifications" ? (
        <Notifications onBack={() => setScreen("home")} />
      ) : screen === "profile" ? (
        <Profile onBack={() => setScreen("settings")} />
      ) : screen === "history" ? (
        <>
          <History
            onVisitPress={(id) => { setSelectedVisitId(id); setVisitReturnTo("history"); setScreen("visit-detail") }}
            onDraftPress={(id) => { setSelectedVisitId(id); setVisitReturnTo("history"); setScreen("visit-draft") }}
          />
          <BottomNav {...navProps} />
        </>
      ) : screen === "team" ? (
        <>
          <Team
            onBarberPress={(id) => { setSelectedBarberId(id); setScreen("barber-detail") }}
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
          onBack={() => { const ret = fromOnboarding; setFromOnboarding(false); setScreen(ret ? "onboarding" : "team") }}
          onUpgradePress={() => setScreen("subscription")}
        />
      ) : screen === "settings" ? (
        <Services
          onBack={() => setScreen("home")}
          onServiceCatalogPress={() => setScreen("service-catalog")}
          onCommissionsPress={() => setScreen("commissions")}
          onClientsPress={() => setScreen("clients")}
          onSubscriptionPress={() => { setSubscriptionReturnTo("settings"); setScreen("subscription") }}
          onShopProfilePress={() => setScreen("shop-profile")}
          onProfilePress={() => setScreen("profile")}
          onSignOut={handleSignOut}
        />
      ) : screen === "service-catalog" ? (
        <ServiceCatalog onBack={() => { const ret = fromOnboarding; setFromOnboarding(false); setScreen(ret ? "onboarding" : "settings") }} />
      ) : screen === "commissions" ? (
        <Commissions onBack={() => setScreen("settings")} />
      ) : screen === "clients" ? (
        <Clients
          onBack={() => setScreen("settings")}
          onClientPress={(id) => { setSelectedClientId(id); setScreen("client-detail") }}
        />
      ) : screen === "client-detail" ? (
        <ClientDetail clientId={selectedClientId} onBack={() => setScreen("clients")} />
      ) : screen === "subscription" ? (
        <Subscription onBack={() => setScreen(subscriptionReturnTo)} />
      ) : screen === "shop-profile" ? (
        <ShopProfile onBack={() => setScreen("settings")} />
      ) : screen === "statements" ? (
        <Statements onBack={() => setScreen("accounting")} />
      ) : screen === "payslips" ? (
        <Payslips onBack={() => setScreen("accounting")} />
      ) : screen === "expenses" ? (
        <Expenses onBack={() => setScreen("accounting")} />
      ) : screen === "barber-detail" ? (
        <BarberDetail onBack={() => setScreen("team")} barberId={selectedBarberId} />
      ) : screen === "new-visit" ? (
        <NewVisit
          onBack={() => { const ret = fromOnboarding; setFromOnboarding(false); setScreen(ret ? "onboarding" : "home") }}
          onConfirm={() => { const ret = fromOnboarding; setFromOnboarding(false); setNotification({ type: "success", message: "Visit confirmed!" }); setScreen(ret ? "onboarding" : "home") }}
        />
      ) : screen === "visit-detail" ? (
        <VisitDetail onBack={() => setScreen(visitReturnTo)} visitId={selectedVisitId} status="validated" />
      ) : screen === "visit-draft" ? (
        <VisitDetail onBack={() => setScreen(visitReturnTo)} visitId={selectedVisitId} status="draft" />
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
          <BarberHistory onVisitPress={(id) => { setSelectedVisitId(id); setVisitReturnTo("barber-history"); setScreen("visit-detail") }} />
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
      ) : null}
      </div>
    </PhoneFrame>
  )
}
