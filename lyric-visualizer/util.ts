/**
 * Gets the OS locale in a format suitable for Musixmatch API
 * @returns Array of [language, country] codes
 */
export function getOSLocale(): [string, string] {
    // Default to English if we can't determine the locale
    const defaultLocale: [string, string] = ['en', 'US'];
    
    try {
        // Try to get the browser's language
        const browserLang = navigator.language || (navigator as any).userLanguage;
        if (browserLang) {
            const parts = browserLang.split('-');
            return [parts[0].toLowerCase(), parts[1]?.toUpperCase() || 'US'];
        }
    } catch (e) {
        console.warn('Could not determine OS locale:', e);
    }
    
    return defaultLocale;
}

/**
 * Simple configuration storage
 */
const configStore: Record<string, any> = {};

export function get(key: string): any {
    return configStore[key];
}

export function set(key: string, value: any): void {
    configStore[key] = value;
} 