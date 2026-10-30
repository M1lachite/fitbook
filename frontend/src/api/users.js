import { request } from './client'

export const getUsers = () => request('/users/')

export const updateUserRole = (id, role) =>
  request(`/users/${id}/`, { method: 'PATCH', body: { role } })