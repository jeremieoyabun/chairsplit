export type UserRole = 'owner' | 'manager' | 'barber'
export type VisitStatus = 'draft' | 'validated' | 'cancelled'
export type ExpenseCategory = 'rent' | 'supplies' | 'utilities' | 'equipment' | 'taxes' | 'other'
export type ExpenseFrequency = 'monthly' | 'one_time'
export type PayslipStatus = 'pending' | 'approved' | 'paid'

export interface Shop {
  id: string
  name: string
  address: string | null
  phone: string | null
  currency: string
  logo_url: string | null
  created_at: string
}

export interface Profile {
  id: string
  shop_id: string | null
  full_name: string
  email: string
  phone: string | null
  avatar_url: string | null
  role: UserRole
  is_active: boolean
  created_at: string
}

export interface Service {
  id: string
  shop_id: string
  category_id: string | null
  name: string
  price: number
  icon: string
  description: string | null
  is_addon: boolean
  is_active: boolean
  sort_order: number
}

export interface ServiceCategory {
  id: string
  shop_id: string
  name: string
  sort_order: number
}

export interface Visit {
  id: string
  shop_id: string
  barber_id: string
  client_id: string | null
  status: VisitStatus
  total_amount: number
  commission_amount: number
  commission_rate: number
  notes: string | null
  visited_at: string
  validated_at: string | null
  cancelled_at: string | null
  created_at: string
  // Joined fields
  barber?: Profile
  client?: Client
  services?: VisitService[]
}

export interface VisitService {
  id: string
  visit_id: string
  service_id: string
  service_name: string
  price: number
}

export interface Client {
  id: string
  shop_id: string
  name: string
  phone: string | null
  email: string | null
  notes: string | null
}

export interface CommissionRule {
  id: string
  shop_id: string
  barber_id: string | null
  service_id: string | null
  rate: number
  is_default: boolean
  barber?: Profile
  service?: Service
}

export interface Expense {
  id: string
  shop_id: string
  label: string
  amount: number
  category: ExpenseCategory
  frequency: ExpenseFrequency
  expense_date: string
}

export interface Payslip {
  id: string
  shop_id: string
  barber_id: string
  month: number
  year: number
  total_visits: number
  total_revenue: number
  total_commission: number
  status: PayslipStatus
  barber?: Profile
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  body: string | null
  data: unknown
  is_read: boolean
  created_at: string
}

export interface DailySummary {
  shop_id: string
  day: string
  validated_visits: number
  draft_visits: number
  total_revenue: number
  total_commissions: number
  avg_ticket: number
}
