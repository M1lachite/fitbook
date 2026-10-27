import { request, saveTokens } from './client'

export async function login(username, password) {
  const tokens = await request('/auth/login/', {
    method: 'POST',
    body: { username, password },
    auth: false,
  })
  saveTokens(tokens)
}

export const register = (data) =>
  request('/auth/register/', { method: 'POST', body: data, auth: false })

export const getMe = () => request('/auth/me/')