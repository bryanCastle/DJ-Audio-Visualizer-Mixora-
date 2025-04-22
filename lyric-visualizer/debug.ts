export function debug(message: string, ...args: any[]) {
    if (process.env.NODE_ENV === 'development') {
        console.log(`[LyricVisualizer] ${message}`, ...args);
    }
} 