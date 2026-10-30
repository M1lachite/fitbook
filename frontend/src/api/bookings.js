import { request } from './client'

export const getMyBookings = () => request('/bookings/')

export const createBooking = (fitnessClassId) =>
  request('/bookings/', { method: 'POST', body: { fitness_class: fitnessClassId } })

export const deleteBooking = (id) => request(`/bookings/${id}/`, { method: 'DELETE' })