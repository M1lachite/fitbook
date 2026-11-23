// Automatyczny test E2E (E2): kluczowa ścieżka użytkownika w przeglądarce (Chromium, tryb headless).
// Scenariusz: otwarcie strony -> rejestracja -> logowanie -> widok zalogowanego użytkownika -> wylogowanie.
// Elementy wyszukujemy po etykietach, rolach i widocznych tekstach, więc test nie zależy od klas CSS.
import { expect, test } from '@playwright/test'

test('użytkownik rejestruje się, loguje i widzi swoje konto', async ({ page }) => {
  const nazwa = `e2e_${Date.now()}_${Math.floor(Math.random() * 1_000_000)}`
  const haslo = 'Haslo-Testowe-123'

  // 1. Otwarcie strony głównej (grafik zajęć jest publiczny).
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Grafik zajęć' })).toBeVisible()

  // 2. Wypełnienie formularza rejestracji i wysłanie go.
  await page.getByRole('button', { name: 'Zarejestruj', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Rejestracja' })).toBeVisible()
  await page.getByLabel('Nazwa użytkownika').fill(nazwa)
  await page.getByLabel('Adres e-mail').fill(`${nazwa}@example.com`)
  await page.getByLabel('Imię').fill('Test')
  await page.getByLabel('Nazwisko').fill('Automat')
  await page.getByLabel('Hasło', { exact: true }).fill(haslo)
  await page.getByLabel('Powtórz hasło').fill(haslo)
  await page.getByRole('button', { name: 'Utwórz konto' }).click()

  // 3. Po poprawnej rejestracji aplikacja przenosi użytkownika na stronę logowania.
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { name: 'Logowanie' })).toBeVisible()

  // 4. Logowanie nowo utworzonym kontem.
  await page.getByLabel('Nazwa użytkownika').fill(nazwa)
  await page.getByLabel('Hasło').fill(haslo)
  await page.getByRole('button', { name: 'Zaloguj się' }).click()

  // 5. Asercja: w pasku nawigacji pojawia się nazwa użytkownika z rolą, a w menu zakładka rezerwacji.
  await expect(page.getByText(`${nazwa} (klient)`)).toBeVisible()
  await page.getByRole('link', { name: 'Moje rezerwacje' }).click()
  await expect(page.getByRole('heading', { name: 'Moje rezerwacje' })).toBeVisible()
  await expect(page.getByText('Nie masz jeszcze żadnych rezerwacji.')).toBeVisible()

  // 6. Wylogowanie: znów widać przycisk logowania, a nazwy użytkownika już nie ma.
  await page.getByRole('button', { name: 'Wyloguj' }).click()
  await expect(page.getByRole('button', { name: 'Zaloguj', exact: true })).toBeVisible()
  await expect(page.getByText(`${nazwa} (klient)`)).toHaveCount(0)
})
