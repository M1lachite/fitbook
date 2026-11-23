// Konfiguracja testów Playwright dla aplikacji FitBook.
import { defineConfig } from '@playwright/test'

// Adres testowanej aplikacji (zmienna LIVE_APP_URL).
// Lokalnie jest to aplikacja uruchomiona przez docker compose (http://localhost:8080),
// a w pipeline - publiczny adres CloudFront po wdrożeniu (https://xxxx.cloudfront.net).
// Ukośniki na końcu adresu usuwamy, żeby ścieżki typu /api/... składały się poprawnie.
const baseURL = (process.env.LIVE_APP_URL || 'http://localhost:8080').replace(/\/+$/, '')

export default defineConfig({
  testDir: '.',
  testMatch: '*.spec.js',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  // W CI jedno ponowienie chroni przed chwilowymi problemami sieci; lokalnie bez ponowień.
  retries: process.env.CI ? 1 : 0,
  // Wynik w konsoli oraz raport HTML (w pipeline zapisywany jako artefakt).
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    // Zrzuty ekranu, nagrania wideo i ślad (trace) zapisujemy tylko dla testów, które się nie powiodły.
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
})
