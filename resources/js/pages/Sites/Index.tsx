// resources/js/Pages/Sites/Index.tsx

import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';

interface Site {
    id: number;
    domain: string;
    server_ip: string;
    status: string;
    status_color: string;
    http_port: number;
    last_deployed_at: string | null;
    created_at: string;
}

interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface IndexProps {
    sites: Site[];
    pagination: Pagination;
}

// Define proper types for route parameters
type RouteParams = Record<string, string | number> | string | number;

// Declare the global route function with proper types
declare const route: (name: string, params?: RouteParams) => string;

export default function Index({ sites, pagination }: IndexProps) {
    const { post } = useForm();

    const handleDeploy = (siteId: number) => {
        post(route('sites.deploy', siteId));
    };

    const handleStop = (siteId: number) => {
        post(route('sites.stop', siteId));
    };

    const getStatusBadge = (status: string, statusColor: string) => {
        const colors: Record<string, string> = {
            green: 'bg-green-100 text-green-800',
            yellow: 'bg-yellow-100 text-yellow-800',
            red: 'bg-red-100 text-red-800',
            gray: 'bg-gray-100 text-gray-800'
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[statusColor] || colors.gray}`}>
                {status}
            </span>
        );
    };

    // Calculate showing range
    const getShowingRange = () => {
        const start = ((pagination.current_page - 1) * pagination.per_page) + 1;
        const end = Math.min(pagination.current_page * pagination.per_page, pagination.total);
        return { start, end };
    };

    const { start, end } = getShowingRange();

    return (
        <AppLayout title="WordPress Sites">
            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                <div className="border-b border-gray-200 bg-white p-6">
                    <h1 className="mb-6 text-2xl font-bold">WordPress Sites</h1>

                    {/* Sites Count and Create Button */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Showing {start} to {end} of {pagination.total} sites
                        </div>
                        <Link
                            href={route('sites.create')}
                            className="rounded-md bg-blue-500 px-4 py-2 text-white transition duration-200 hover:bg-blue-600"
                        >
                            Add New Site
                        </Link>
                    </div>

                    {!sites || sites.length === 0 ? (
                        <div className="py-12 text-center">
                            <div className="mb-4 text-gray-400">
                                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1}
                                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                            <p className="mb-4 text-lg text-gray-500">No WordPress sites configured yet.</p>
                            <Link
                                href={route('sites.create')}
                                className="rounded-md bg-blue-500 px-6 py-3 text-white transition duration-200 hover:bg-blue-600"
                            >
                                Create Your First Site
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* Sites Table */}
                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">#</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Domain</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Server</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Port</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Last Deployed
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {sites.map((site, index) => (
                                            <tr key={site.id} className="transition duration-150 hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{ ++index }</div></td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <p>
                                                        <a
                                                            href={`http://${site.domain}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-medium text-blue-600 hover:text-blue-900 hover:underline"
                                                        >
                                                            {site.domain}
                                                        </a>
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">{site.server_ip}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(site.status, site.status_color)}</td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                                    <div>HTTP: {site.http_port}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                                    {site.last_deployed_at ? (
                                                        new Date(site.last_deployed_at).toLocaleString()
                                                    ) : (
                                                        <span className="text-gray-400">Never</span>
                                                    )}
                                                </td>
                                                <td className="space-x-2 px-6 py-4 text-sm font-medium whitespace-nowrap">
                                                    <div className="flex space-x-2">
                                                        {site.status !== 'running' && (
                                                            <button
                                                                onClick={() => handleDeploy(site.id)}
                                                                className="rounded px-2 py-1 text-green-600 transition duration-150 hover:bg-green-50 hover:text-green-900 cursor-pointer"
                                                                title="Deploy Site"
                                                            >
                                                                Deploy
                                                            </button>
                                                        )}
                                                        {site.status === 'running' && (
                                                            <button
                                                                onClick={() => handleStop(site.id)}
                                                                className="rounded px-2 py-1 text-orange-600 transition duration-150 hover:bg-yellow-50 hover:text-yellow-900 cursor-pointer"
                                                                title="Stop Site"
                                                            >
                                                                Stop
                                                            </button>
                                                        )}
                                                        <Link
                                                            href={route('sites.edit', site.id)}
                                                            className="rounded px-2 py-1 text-yellow-600 transition duration-150 hover:bg-red-50 hover:text-red-900 cursor-pointer"
                                                        >Edit
                                                        </Link>
                                                        <Link
                                                            href={route('sites.destroy', site.id)}
                                                            method="delete"
                                                            as="button"
                                                            className="rounded px-2 py-1 text-red-600 transition duration-150 hover:bg-red-50 hover:text-red-900 cursor-pointer"
                                                            title="Delete Site"
                                                            onClick={(e: React.MouseEvent) => {
                                                                if (!confirm('Are you sure you want to delete this site?')) {
                                                                    e.preventDefault();
                                                                }
                                                            }}
                                                        >
                                                            Delete
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pagination && pagination.last_page > 1 && (
                                <div className="mt-6 flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Showing {start} to {end} of {pagination.total} results
                                    </div>
                                    <div className="flex space-x-2">
                                        {/* Previous Page */}
                                        {pagination.current_page > 1 && (
                                            <Link
                                                href={route('sites.index', { page: pagination.current_page - 1 })}
                                                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition duration-150 hover:bg-gray-50"
                                                preserveScroll
                                            >
                                                Previous
                                            </Link>
                                        )}

                                        {/* Page Numbers - Show limited pages for better UX */}
                                        <div className="hidden space-x-2 sm:flex">
                                            {/* First Page */}
                                            {pagination.current_page > 2 && (
                                                <Link
                                                    href={route('sites.index', { page: 1 })}
                                                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition duration-150 hover:bg-gray-50"
                                                    preserveScroll
                                                >
                                                    1
                                                </Link>
                                            )}

                                            {/* Ellipsis if needed */}
                                            {pagination.current_page > 3 && <span className="px-3 py-2 text-gray-500">...</span>}

                                            {/* Current page and neighbors */}
                                            {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                                                const page = pagination.current_page - 2 + i;
                                                if (page > 0 && page <= pagination.last_page) {
                                                    return (
                                                        <Link
                                                            key={page}
                                                            href={route('sites.index', { page })}
                                                            className={`rounded-md px-3 py-2 text-sm font-medium transition duration-150 ${
                                                                page === pagination.current_page
                                                                    ? 'bg-blue-500 text-white'
                                                                    : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                                            }`}
                                                            preserveScroll
                                                        >
                                                            {page}
                                                        </Link>
                                                    );
                                                }
                                                return null;
                                            }).filter(Boolean)}

                                            {/* Ellipsis if needed */}
                                            {pagination.current_page < pagination.last_page - 2 && (
                                                <span className="px-3 py-2 text-gray-500">...</span>
                                            )}

                                            {/* Last Page */}
                                            {pagination.current_page < pagination.last_page - 1 && (
                                                <Link
                                                    href={route('sites.index', { page: pagination.last_page })}
                                                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition duration-150 hover:bg-gray-50"
                                                    preserveScroll
                                                >
                                                    {pagination.last_page}
                                                </Link>
                                            )}
                                        </div>

                                        {/* Next Page */}
                                        {pagination.current_page < pagination.last_page && (
                                            <Link
                                                href={route('sites.index', { page: pagination.current_page + 1 })}
                                                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition duration-150 hover:bg-gray-50"
                                                preserveScroll
                                            >
                                                Next
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
