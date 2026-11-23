// Testy integracyjne REST API (E1): statusy HTTP, nagłówki i struktura odpowiedzi.
// Testy używają klienta HTTP Playwrighta (fixture "request"), bez przeglądarki.
// Adres aplikacji pochodzi ze zmiennej LIVE_APP_URL (patrz playwright.config.js).
import { expect, test } from '@playwright/test'

const HASLO = 'Haslo-Testowe-123'

// Każdy test tworzy własne konto z unikalną nazwą, więc testy nie zależą od danych w bazie
// i nie przeszkadzają sobie nawzajem (także przy kolejnych uruchomieniach na tym samym środowisku).
function noweKonto() {
  const nazwa = `qa_${Date.now()}_${Math.floor(Math.random() * 1_000_000)}`
  return {
    username: nazwa,
    email: `${nazwa}@example.com`,
    first_name: 'Test',
    last_name: 'Automat',
    password: HASLO,
  }
}

// Rejestruje konto i loguje je, zwraca dane konta oraz token dostępu (JWT).
async function zalozIZaloguj(request) {
  const konto = noweKonto()
  const rejestracja = await request.post('/api/auth/register/', { data: konto })
  expect(rejestracja.status()).toBe(201)
  const logowanie = await request.post('/api/auth/login/', {
    data: { username: konto.username, password: konto.password },
  })
  expect(logowanie.status()).toBe(200)
  const { access } = await logowanie.json()
  return { konto, naglowki: { Authorization: `Bearer ${access}` } }
}

test.describe('Health check', () => {
  test('GET /api/health/ zwraca 200 i status UP', async ({ request }) => {
    const odpowiedz = await request.get('/api/health/')
    expect(odpowiedz.status()).toBe(200)
    expect(odpowiedz.headers()['content-type']).toContain('application/json')
    expect(await odpowiedz.json()).toEqual({ status: 'UP', database: 'CONNECTED' })
  })
})

test.describe('Zajęcia (endpointy publiczne)', () => {
  test('GET /api/classes/ zwraca 200, JSON i listę zajęć', async ({ request }) => {
    const odpowiedz = await request.get('/api/classes/')
    expect(odpowiedz.status()).toBe(200)
    expect(odpowiedz.headers()['content-type']).toContain('application/json')
    expect(Array.isArray(await odpowiedz.json())).toBe(true)
  })

  test('GET /api/classes/{id}/ dla nieistniejących zajęć zwraca 404', async ({ request }) => {
    const odpowiedz = await request.get('/api/classes/999999/')
    expect(odpowiedz.status()).toBe(404)
  })
})

test.describe('Rejestracja i logowanie', () => {
  test('POST /api/auth/register/ tworzy konto (201) i nie zwraca hasła', async ({ request }) => {
    const konto = noweKonto()
    const odpowiedz = await request.post('/api/auth/register/', { data: konto })
    expect(odpowiedz.status()).toBe(201)
    expect(odpowiedz.headers()['content-type']).toContain('application/json')
    const dane = await odpowiedz.json()
    expect(typeof dane.id).toBe('number')
    expect(dane.username).toBe(konto.username)
    expect(dane.email).toBe(konto.email)
    expect(dane).not.toHaveProperty('password')
  })

  test('POST /api/auth/register/ odrzuca zajętą nazwę użytkownika (400)', async ({ request }) => {
    const konto = noweKonto()
    expect((await request.post('/api/auth/register/', { data: konto })).status()).toBe(201)
    const ponownie = await request.post('/api/auth/register/', { data: konto })
    expect(ponownie.status()).toBe(400)
    expect(await ponownie.json()).toHaveProperty('username')
  })

  test('POST /api/auth/register/ odrzuca zbyt słabe hasło (400)', async ({ request }) => {
    const odpowiedz = await request.post('/api/auth/register/', {
      data: { ...noweKonto(), password: '123' },
    })
    expect(odpowiedz.status()).toBe(400)
    expect(await odpowiedz.json()).toHaveProperty('password')
  })

  test('POST /api/auth/login/ zwraca parę tokenów JWT (200)', async ({ request }) => {
    const konto = noweKonto()
    await request.post('/api/auth/register/', { data: konto })
    const odpowiedz = await request.post('/api/auth/login/', {
      data: { username: konto.username, password: konto.password },
    })
    expect(odpowiedz.status()).toBe(200)
    expect(odpowiedz.headers()['content-type']).toContain('application/json')
    const dane = await odpowiedz.json()
    expect(typeof dane.access).toBe('string')
    expect(typeof dane.refresh).toBe('string')
  })

  test('POST /api/auth/login/ odrzuca błędne hasło (401)', async ({ request }) => {
    const konto = noweKonto()
    await request.post('/api/auth/register/', { data: konto })
    const odpowiedz = await request.post('/api/auth/login/', {
      data: { username: konto.username, password: 'zle-haslo-123' },
    })
    expect(odpowiedz.status()).toBe(401)
  })
})

test.describe('Dostęp do zasobów chronionych', () => {
  test('GET /api/auth/me/ bez tokenu zwraca 401', async ({ request }) => {
    expect((await request.get('/api/auth/me/')).status()).toBe(401)
  })

  test('GET /api/auth/me/ z tokenem zwraca profil z rolą CLIENT (200)', async ({ request }) => {
    const { konto, naglowki } = await zalozIZaloguj(request)
    const odpowiedz = await request.get('/api/auth/me/', { headers: naglowki })
    expect(odpowiedz.status()).toBe(200)
    const dane = await odpowiedz.json()
    expect(dane.username).toBe(konto.username)
    expect(dane.role).toBe('CLIENT')
  })

  test('GET /api/bookings/ wymaga logowania, a nowe konto nie ma rezerwacji', async ({ request }) => {
    expect((await request.get('/api/bookings/')).status()).toBe(401)
    const { naglowki } = await zalozIZaloguj(request)
    const odpowiedz = await request.get('/api/bookings/', { headers: naglowki })
    expect(odpowiedz.status()).toBe(200)
    expect(await odpowiedz.json()).toEqual([])
  })

  test('POST /api/classes/ nie pozwala dodawać zajęć klientowi (403) ani anonimowi (401)', async ({ request }) => {
    const noweZajecia = {
      title: 'Test',
      description: 'Zajęcia testowe',
      instructor: 'Jan Kowalski',
      start_time: '2030-01-01T10:00:00+01:00',
      capacity: 10,
    }
    expect((await request.post('/api/classes/', { data: noweZajecia })).status()).toBe(401)
    const { naglowki } = await zalozIZaloguj(request)
    const jakoKlient = await request.post('/api/classes/', { data: noweZajecia, headers: naglowki })
    expect(jakoKlient.status()).toBe(403)
  })

  test('GET /api/users/ jest zarezerwowane dla administratora (403 dla klienta)', async ({ request }) => {
    const { naglowki } = await zalozIZaloguj(request)
    expect((await request.get('/api/users/', { headers: naglowki })).status()).toBe(403)
  })
})
