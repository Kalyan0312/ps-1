export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  base_rate: number;
  minimum_wage_floor: number;
  icon_name: string;
  is_active: boolean;
  workers_available: number;
}

export interface BookingSummary {
  id: string;
  booking_reference: string;
  category_name: string;
  status: string;
  service_address: string;
  scheduled_time: string;
  estimated_fare: number;
  worker_share: number;
  cooperative_share: number;
  worker_name?: string;
  worker_phone?: string;
  worker_rating?: number;
  eta_minutes?: number;
  created_at: string;
}

const API_BASE = 'https://ps-1-rtys.vercel.app/api/v1';

export async function fetchServiceCategories(): Promise<ServiceCategory[]> {
  const res = await fetch(`${API_BASE}/services/categories`);
  if (!res.ok) {
    throw new Error('Failed to load service categories');
  }
  return res.json();
}

export async function createBooking(
  categoryId: string,
  serviceAddress: string,
  notes?: string
): Promise<BookingSummary> {
  const res = await fetch(`${API_BASE}/services/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category_id: categoryId,
      service_address: serviceAddress,
      notes: notes || 'Dispatched via Customer Portal'
    })
  });
  if (!res.ok) {
    throw new Error('Failed to create service booking');
  }
  return res.json();
}

export async function fetchCustomerBookings(): Promise<BookingSummary[]> {
  const res = await fetch(`${API_BASE}/services/my-bookings`);
  if (!res.ok) {
    throw new Error('Failed to load bookings');
  }
  return res.json();
}
