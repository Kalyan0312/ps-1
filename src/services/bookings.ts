import { FactorInput, AppliedFactorItem } from './pricing';

export interface CustomerInfo {
  id: string;
  full_name: string;
  phone_number: string;
  address: string;
}

export interface WorkerInfo {
  id: string;
  full_name: string;
  phone_number: string;
  rating: number;
  photo: string;
  upi_id?: string;
}

export interface ServiceInfo {
  id: string;
  name: string;
  slug: string;
}

export interface PriceBreakdown {
  base_price: number;
  surcharge: number;
  final_price: number;
  worker_share: number;
  worker_payout_percent: number;
  cooperative_share: number;
  cooperative_fee_percent: number;
  welfare_share: number;
  welfare_contribution_percent: number;
}

export interface BookingDetail {
  id: string;
  booking_reference: string;
  booking_type: 'scheduled' | 'emergency';
  service: ServiceInfo;
  customer: CustomerInfo;
  worker?: WorkerInfo | null;
  status: 'requested' | 'confirmed' | 'worker_assigned' | 'worker_en_route' | 'in_progress' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'escrow_held' | 'paid' | 'refunded' | 'failed';
  price: PriceBreakdown;
  pricing_factors: AppliedFactorItem[];
  scheduled_time: string;
  eta_minutes?: number;
  created_at: string;
  started_at?: string | null;
  completed_at?: string | null;
  notes?: string | null;
}

export interface PaymentOrder {
  order_id: string;
  booking_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  upi_vpa: string;
  upi_intent_uri: string;
  is_demo_mode: boolean;
  created_at: number;
}

export interface PaymentVerificationResult {
  success: boolean;
  payment_id: string;
  status: string;
  message: string;
  escrow_held_at: string;
}

export interface InvoiceData {
  invoice_number: string;
  invoice_date: string;
  booking_reference: string;
  booking_id: string;
  service_name: string;
  customer: CustomerInfo;
  worker?: WorkerInfo | null;
  base_price: number;
  dynamic_surcharges: AppliedFactorItem[];
  surcharge_total: number;
  worker_earning: number;
  worker_share_percent: number;
  cooperative_fee: number;
  cooperative_fee_percent: number;
  welfare_contribution: number;
  welfare_contribution_percent: number;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  payment_status: string;
  payment_method: string;
  transaction_id: string;
  is_cooperative_verified: boolean;
}

export interface CreateBookingPayload {
  service_id: string;
  worker_id?: string;
  customer_name?: string;
  customer_phone?: string;
  service_address: string;
  booking_type?: 'scheduled' | 'emergency';
  scheduled_time?: string;
  notes?: string;
  factors?: FactorInput;
  payment_method?: string;
}

const API_BASE = 'https://ps-1-rtys.vercel.app/api/v1';

export async function createBooking(payload: CreateBookingPayload): Promise<BookingDetail> {
  const res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to create booking');
  return res.json();
}

export async function fetchBookings(statusFilter?: string): Promise<BookingDetail[]> {
  const url = statusFilter
    ? `${API_BASE}/bookings?status=${statusFilter}`
    : `${API_BASE}/bookings`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch bookings');
  return res.json();
}

export async function fetchBookingById(bookingId: string): Promise<BookingDetail> {
  const res = await fetch(`${API_BASE}/bookings/${bookingId}`);
  if (!res.ok) throw new Error(`Booking ${bookingId} not found`);
  return res.json();
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingDetail['status'],
  cancellationReason?: string
): Promise<BookingDetail> {
  const res = await fetch(`${API_BASE}/bookings/${bookingId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, cancellation_reason: cancellationReason })
  });
  if (!res.ok) throw new Error('Failed to update booking status');
  return res.json();
}

export async function initiatePayment(bookingId: string, upiApp = 'gpay'): Promise<PaymentOrder> {
  const res = await fetch(`${API_BASE}/bookings/${bookingId}/payment/initiate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ booking_id: bookingId, upi_app: upiApp })
  });
  if (!res.ok) throw new Error('Failed to initiate payment');
  return res.json();
}

export async function verifyPayment(
  bookingId: string,
  paymentId: string,
  orderId: string,
  signature: string
): Promise<PaymentVerificationResult> {
  const res = await fetch(`${API_BASE}/bookings/${bookingId}/payment/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      payment_id: paymentId,
      order_id: orderId,
      signature: signature
    })
  });
  if (!res.ok) throw new Error('Payment verification failed');
  return res.json();
}

export async function fetchBookingInvoice(bookingId: string): Promise<InvoiceData> {
  const res = await fetch(`${API_BASE}/bookings/${bookingId}/invoice`);
  if (!res.ok) throw new Error('Failed to fetch itemised invoice');
  return res.json();
}
