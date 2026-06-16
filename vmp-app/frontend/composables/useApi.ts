import { useAuthStore } from '~/stores/auth'

export function useApi() {
  const config = useRuntimeConfig()
  const auth = useAuthStore()

  function getHeaders() {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (auth.token) headers['Authorization'] = `Bearer ${auth.token}`
    return headers
  }

  async function get<T>(path: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${config.public.apiBase}${path}`)
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v))
      })
    }
    const res = await fetch(url.toString(), { headers: getHeaders() })
    if (!res.ok) throw await res.json()
    return res.json()
  }

  async function post<T>(path: string, body: any): Promise<T> {
    const res = await fetch(`${config.public.apiBase}${path}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    })
    if (!res.ok) throw await res.json()
    return res.json()
  }

  async function put<T>(path: string, body: any): Promise<T> {
    const res = await fetch(`${config.public.apiBase}${path}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    })
    if (!res.ok) throw await res.json()
    return res.json()
  }

  async function patch<T>(path: string, body: any): Promise<T> {
    const res = await fetch(`${config.public.apiBase}${path}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(body),
    })
    if (!res.ok) throw await res.json()
    return res.json()
  }

  async function del<T>(path: string): Promise<T> {
    const res = await fetch(`${config.public.apiBase}${path}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })
    if (!res.ok) throw await res.json()
    return res.json()
  }

  async function uploadFile<T>(path: string, file: File, fieldName = 'file'): Promise<T> {
    const form = new FormData()
    form.append(fieldName, file)
    const headers: Record<string, string> = {}
    if (auth.token) headers['Authorization'] = `Bearer ${auth.token}`
    const res = await fetch(`${config.public.apiBase}${path}`, {
      method: 'POST',
      headers,
      body: form,
    })
    if (!res.ok) throw await res.json()
    return res.json()
  }

  return { get, post, put, patch, del, uploadFile }
}
