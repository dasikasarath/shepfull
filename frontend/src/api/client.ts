import { handleMockRequest } from './mock-handler'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export class ApiClientError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
  }
}

async function parseError(response: Response): Promise<string> {
  try {
    const text = await response.text()
    return text || response.statusText || 'Request failed'
  } catch {
    return response.statusText || 'Request failed'
  }
}

/**
 * Whether mock mode is active. Starts as false; switches to true
 * the first time a real request fails with a network error (backend down).
 * Once the backend comes back up, you can reload the page to try real mode again.
 */
let useMockMode = false

/** Manually check if we should display the mock banner */
export function isMockMode(): boolean {
  return useMockMode
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  _auth = true,
): Promise<T> {
  const headers = new Headers(options.headers)

  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  // ── Try real backend first (unless already in mock mode) ──
  if (!useMockMode) {
    try {
      const response = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
        credentials: 'include',
      })

      // Vite proxy returns 502 when the backend is unreachable.
      // Treat this as "backend down" and switch to mock mode.
      if (response.status === 502) {
        console.warn('[Sheprenure] Backend returned 502 — switching to mock mode')
        useMockMode = true
        showMockBanner()
        // Fall through to mock handler below
      } else if (!response.ok) {
        const message = await parseError(response)
        throw new ApiClientError(message, response.status)
      } else {
        const contentType = response.headers.get('content-type') ?? ''
        if (contentType.includes('application/json')) {
          return response.json() as Promise<T>
        }
        return response.text() as Promise<T>
      }
    } catch (err) {
      // If it's a known API error (4xx/5xx from a live backend), let it through
      if (err instanceof ApiClientError) {
        throw err
      }
      // Network error → backend is unreachable → switch to mock mode
      console.warn('[Sheprenure] Backend unreachable — switching to mock mode')
      useMockMode = true
      showMockBanner()
    }
  }

  // ── Mock mode fallback ──────────────────────────────────────
  let body: unknown = undefined
  let formData: FormData | undefined = undefined

  if (options.body instanceof FormData) {
    formData = options.body
  } else if (typeof options.body === 'string') {
    try {
      body = JSON.parse(options.body)
    } catch {
      body = options.body
    }
  }

  const method = options.method ?? 'GET'
  const mockResult = await handleMockRequest(path, method, body, formData)

  if (mockResult) {
    if (!mockResult.ok) {
      throw new ApiClientError(mockResult.data as string, mockResult.status)
    }
    return mockResult.data as T
  }

  throw new ApiClientError('Endpoint not found in mock handler', 404)
}

export async function apiText(
  path: string,
  options: RequestInit = {},
  auth = true,
): Promise<string> {
  return apiRequest<string>(path, options, auth)
}

// ── Mock mode banner ──────────────────────────────────────────
let bannerShown = false
function showMockBanner() {
  if (bannerShown) return
  bannerShown = true

  const banner = document.createElement('div')
  banner.id = 'mock-mode-banner'
  banner.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 9999;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: white;
      padding: 8px 16px;
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 13px;
      font-weight: 500;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    ">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      <span>Demo Mode — Backend is offline. Using mock data. Login with <strong>john / john1234</strong> (user) or <strong>admin / admin123</strong> (admin).</span>
      <button onclick="this.parentElement.parentElement.remove()" style="
        background: rgba(255,255,255,0.2);
        border: none;
        border-radius: 4px;
        color: white;
        cursor: pointer;
        padding: 2px 8px;
        font-size: 12px;
        margin-left: 8px;
      ">✕</button>
    </div>
  `
  document.body.prepend(banner)
}
