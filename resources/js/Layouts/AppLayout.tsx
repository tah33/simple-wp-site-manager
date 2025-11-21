// resources/js/Layouts/AppLayout.tsx

import React, { ReactNode } from 'react';
import { Head, Link } from '@inertiajs/react';

interface AppLayoutProps {
    children: ReactNode;
    title?: string;
}

// Define proper types for route parameters
type RouteParams = Record<string, string | number> | string | number;

// Declare the global route function with proper types
declare const route: (name: string, params?: RouteParams) => string;

export default function AppLayout({ children, title }: AppLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-100">
            <Head title={title} />

            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link
                                href={route('sites.index')}
                                className="text-xl font-bold text-gray-800"
                            >
                                WP Site Manager
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                href={route('sites.create')}
                                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                            >
                                Add New Site
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
