import { request } from './client'

export const getClasses = () => request('/classes/', { auth: false })

export const createClass = (data) => request('/classes/', { method: 'POST', body: data })

export const updateClass = (id, data) =>
  request(`/classes/${id}/`, { method: 'PUT', body: data })

export const deleteClass = (id) => request(`/classes/${id}/`, { method: 'DELETE' })

export const getParticipants = (id) => request(`/classes/${id}/participants/`)