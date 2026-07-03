interface ApiResponse<T = any> {
    success: boolean
    data?: T
    error?: string
}

interface QuoteRequestData {
    name: string
    email: string
    phone: string
    address: string
    city?: string
    zipCode: string
    serviceType: string
    propertySize?: string
    description: string
    photos?: File[]
    photoUrls?: string[]
}

class ApiClient {
    private baseUrl: string

    constructor(baseUrl: string = '/api') {
        this.baseUrl = baseUrl
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            })

            const data = (await response.json()) as any

            if (!response.ok) {
                throw new Error(data.error || 'Request failed')
            }

            return { success: true, data }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            }
        }
    }

    async validateZipCode(zipCode: string): Promise<ApiResponse<{
        valid: boolean
        location?: string
        message?: string
    }>> {
        // Service area validation logic
        // El Dorado: 71730, 71731, 71740, 71743, 71753, 71759, 71762, 71764, 71770 (50-mile radius)

        // Note: In a real app this should be server-side to avoid exposing logic/lists, but requested here.
        const elDoradoZips = ['71730', '71731', '71740', '71743', '71753', '71759', '71762', '71764', '71770']

        if (elDoradoZips.includes(zipCode)) {
            return {
                success: true,
                data: {
                    valid: true,
                    location: 'El Dorado, AR',
                    message: 'Great! We serve your area.',
                },
            }
        }

        return {
            success: true,
            data: {
                valid: false,
                message: 'Sorry, we don\'t currently serve this area. Please call us at (870) 866-5101 to discuss options.',
            },
        }
    }

    async submitQuoteRequest(data: QuoteRequestData): Promise<ApiResponse> {
        // Use provided photoUrls (from R2) if available, otherwise fall back to base64 conversion
        let photoUrls: string[] = data.photoUrls || []

        // Only convert to base64 if no photoUrls provided and photos exist (backwards compatibility)
        if (photoUrls.length === 0 && data.photos && data.photos.length > 0) {
            photoUrls = await Promise.all(
                Array.from(data.photos).map(async (file) => {
                    return new Promise<string>((resolve) => {
                        const reader = new FileReader()
                        reader.onloadend = () => resolve(reader.result as string)
                        reader.readAsDataURL(file)
                    })
                })
            )
        }

        // Exclude photos property to avoid serialization issues
        const { photos, ...dataWithoutPhotos } = data

        return this.request('/quotes/request', {
            method: 'POST',
            body: JSON.stringify({
                ...dataWithoutPhotos,
                photoUrls: photoUrls.length > 0 ? photoUrls : undefined,
            }),
        })
    }

    async submitContact(data: {
        name: string
        email: string
        phone?: string
        subject: string
        message: string
    }): Promise<ApiResponse> {
        return this.request('/contact', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    async subscribeNewsletter(email: string): Promise<ApiResponse> {
        return this.request('/newsletter/subscribe', {
            method: 'POST',
            body: JSON.stringify({ email }),
        })
    }
}

export const api = new ApiClient()
