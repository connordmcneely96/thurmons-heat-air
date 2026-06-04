export function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth_token')
}

export function setAuthToken(token: string): void {
    localStorage.setItem('auth_token', token)
}

export function removeAuthToken(): void {
    localStorage.removeItem('auth_token')
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = getAuthToken()

    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    })
}
