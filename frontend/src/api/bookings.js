const API_URL = import.meta.env.VITE_API_URL

export async function getMyBookings() {
  const response = await fetch(`${API_URL}/bookings.json`)
  if (!response.ok) {
    throw new Error('Nie udało się pobrać rezerwacji')
  }
  return response.json()
}