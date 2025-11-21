// resources/js/types/ziggy.d.ts

declare module 'ziggy-js' {
    export interface ZiggyConfig {
        routes: {
            [name: string]: {
                uri: string;
                methods: string[];
                domain?: string;
            };
        };
        url: string;
        port?: number | null;
    }

    export type RouteParams =
        | { [key: string]: string | number | boolean | null | undefined }
        | string
        | number
        | Array<string | number>;

    export default function route(
        name: string,
        params?: RouteParams,
        absolute?: boolean,
        config?: ZiggyConfig
    ): string;

    export const Router: typeof route;

    export function current(): string | undefined;
    export function current(name: string): boolean;
    export function has(name: string): boolean;
    export function getParams(): { [key: string]: string | number | boolean | null | undefined };
}
