export interface NewsletterSubscribeInput {
    email: string;
    name?: string;
    source?: string;
}

export const newsletterSubscribeSchema = {
    email: { required: true, format: 'email' },
    name: { required: false, maxLength: 100 },
    source: { required: false, maxLength: 100 },
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

export function validateNewsletterSubscribePayload(
    payload: unknown
): { success: boolean; errors: string[]; data?: NewsletterSubscribeInput } {
    if (!payload || typeof payload !== 'object') {
        return {
            success: false,
            errors: ['Request body must be a JSON object'],
        };
    }

    const { email, name, source } = payload as Record<string, unknown>;
    const errors: string[] = [];

    const emailValue = typeof email === 'string' ? email.trim() : '';
    if (emailValue.length === 0) {
        errors.push('Email is required');
    } else if (!emailRegex.test(emailValue)) {
        errors.push('Invalid email format');
    }

    let nameValue: string | undefined;
    if (name !== undefined && name !== null) {
        if (typeof name !== 'string') {
            errors.push('Name must be a string');
        } else {
            const trimmed = name.trim();
            if (trimmed.length > 100) {
                errors.push('Name is too long');
            } else if (trimmed.length > 0) {
                nameValue = trimmed;
            }
        }
    }

    let sourceValue: string | undefined;
    if (source !== undefined && source !== null) {
        if (typeof source !== 'string') {
            errors.push('Source must be a string');
        } else {
            const trimmed = source.trim();
            if (trimmed.length > 100) {
                errors.push('Source is too long');
            } else if (trimmed.length > 0) {
                sourceValue = trimmed;
            }
        }
    }

    if (errors.length > 0) {
        return { success: false, errors };
    }

    return {
        success: true,
        errors: [],
        data: {
            email: normalizeEmail(emailValue),
            name: nameValue,
            source: sourceValue,
        },
    };
}
