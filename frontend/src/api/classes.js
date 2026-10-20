const API_URL = import.meta.env.VITE_API_URL

export async function getClasses() {
  const response = await fetch(`${API_URL}/classes.json`)
  if (!response.ok) {
    throw new Error('Nie udało się pobrać zajęć')
  }
  return response.json()
}