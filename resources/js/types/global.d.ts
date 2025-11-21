declare function route(
    name: string,
    params?: Record<string, unknown> | string | number,
    absolute?: boolean
): string;

declare module 'ziggy-js' {
    export default function route(
        name: string,
        params?: Record<string, unknown> | string | number,
        absolute?: boolean
    ): string;
}
