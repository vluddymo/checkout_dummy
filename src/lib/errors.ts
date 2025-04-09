export function hasMessage(error: unknown): error is { message: string } {
    return (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as Record<string, unknown>).message === 'string'
    );
}

export function hasNestedMessage(error: unknown): error is { error: { message: string } } {
    if (
        typeof error === 'object' &&
        error !== null &&
        'error' in error
    ) {
        const nested = (error as { error?: unknown }).error;

        return (
            typeof nested === 'object' &&
            nested !== null &&
            'message' in nested &&
            typeof (nested as Record<string, unknown>).message === 'string'
        );
    }

    return false;
}

export function parseErrorMessage(error: unknown): string {
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    if (hasMessage(error)) return error.message;
    if (hasNestedMessage(error)) return error.error.message;

    try {
        return JSON.stringify(error);
    } catch {
        return 'Ein unbekannter Fehler ist aufgetreten.';
    }
}