// resources/js/Pages/Sites/Edit.tsx

import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';

// Define proper types for route parameters
type RouteParams = Record<string, string | number> | string | number;

// Declare the global route function with proper types
declare const route: (name: string, params?: RouteParams) => string;

type AuthMethod = 'password' | 'key';

interface Site {
    id: number;
    domain: string;
    server_ip: string;
    server_port: number;
    server_username: string;
    auth_method: AuthMethod;
    ssh_password?: string;
    ssh_private_key?: string;
    http_port: number;
    https_port: number;
    wp_admin_user: string;
    wp_admin_password: string;
    wp_admin_email: string;
}

interface EditProps {
    site: Site;
}

export default function Edit({ site }: EditProps) {
    const [authMethod, setAuthMethod] = useState<AuthMethod>(site.auth_method || 'key');
    const [showSshPassword, setShowSshPassword] = useState(false);
    const [showWpPassword, setShowWpPassword] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        domain: site.domain || '',
        server_ip: site.server_ip || '',
        server_port: site.server_port || 22,
        server_username: site.server_username || 'root',
        auth_method: site.auth_method || 'key',
        ssh_password: site.ssh_password || '',
        ssh_private_key: site.ssh_private_key || '',
        http_port: site.http_port || 8080,
        https_port: site.https_port || 8443,
        wp_admin_user: site.wp_admin_user || 'admin',
        wp_admin_password: site.wp_admin_password || '',
        wp_admin_email: site.wp_admin_email || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Prepare the data to send - handle auth fields properly
        const submitData = { ...data };

        // Ensure only the relevant auth field is sent based on the selected method
        if (authMethod === 'password') {
            // Remove ssh_private_key when using password auth
            submitData.ssh_private_key = '';
        } else {
            // Remove ssh_password when using key auth
            submitData.ssh_password = '';
        }

        // @ts-ignore
        put(route('sites.update', site.id), submitData);
    };

    const handleAuthMethodChange = (method: AuthMethod) => {
        setAuthMethod(method);
        setData('auth_method', method);

        // Clear the other auth field when switching methods
        if (method === 'password') {
            setData('ssh_private_key', '');
        } else {
            setData('ssh_password', '');
        }
    };

    // Eye icon component
    const EyeIcon = ({ show, setShow }: { show: boolean; setShow: (show: boolean) => void }) => (
        <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
        >
            {show ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
            ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
            )}
        </button>
    );

    return (
        <AppLayout title={`Edit ${site.domain}`}>
            <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6 bg-white border-b border-gray-200">
                        <h1 className="text-2xl font-bold mb-6">Edit Site: {site.domain}</h1>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Basic Information Section */}
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Domain */}
                                    <div>
                                        <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
                                            Domain Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="domain"
                                            value={data.domain}
                                            onChange={e => setData('domain', e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="example.com"
                                        />
                                        {errors.domain && <p className="text-red-500 text-sm mt-1">{errors.domain}</p>}
                                    </div>

                                    {/* Server IP */}
                                    <div>
                                        <label htmlFor="server_ip" className="block text-sm font-medium text-gray-700">
                                            Server IP Address *
                                        </label>
                                        <input
                                            type="text"
                                            id="server_ip"
                                            value={data.server_ip}
                                            onChange={e => setData('server_ip', e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="192.168.1.100"
                                        />
                                        {errors.server_ip && <p className="text-red-500 text-sm mt-1">{errors.server_ip}</p>}
                                    </div>

                                    {/* Server Port */}
                                    <div>
                                        <label htmlFor="server_port" className="block text-sm font-medium text-gray-700">
                                            SSH Port *
                                        </label>
                                        <input
                                            type="number"
                                            id="server_port"
                                            value={data.server_port}
                                            onChange={e => setData('server_port', parseInt(e.target.value))}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                            min="1"
                                            max="65535"
                                        />
                                        {errors.server_port && <p className="text-red-500 text-sm mt-1">{errors.server_port}</p>}
                                    </div>

                                    {/* Server Username */}
                                    <div>
                                        <label htmlFor="server_username" className="block text-sm font-medium text-gray-700">
                                            SSH Username *
                                        </label>
                                        <input
                                            type="text"
                                            id="server_username"
                                            value={data.server_username}
                                            onChange={e => setData('server_username', e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        {errors.server_username && <p className="text-red-500 text-sm mt-1">{errors.server_username}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* SSH Authentication Section */}
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">SSH Authentication</h2>

                                {/* Authentication Method Selection */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Authentication Method *
                                    </label>
                                    <div className="flex space-x-4">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                className="form-radio text-blue-600"
                                                name="auth_method"
                                                checked={authMethod === 'key'}
                                                onChange={() => handleAuthMethodChange('key')}
                                            />
                                            <span className="ml-2">SSH Private Key</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                className="form-radio text-blue-600"
                                                name="auth_method"
                                                checked={authMethod === 'password'}
                                                onChange={() => handleAuthMethodChange('password')}
                                            />
                                            <span className="ml-2">Password</span>
                                        </label>
                                    </div>
                                </div>

                                {/* SSH Private Key Field */}
                                {authMethod === 'key' && (
                                    <div>
                                        <label htmlFor="ssh_private_key" className="block text-sm font-medium text-gray-700">
                                            SSH Private Key *
                                        </label>
                                        <textarea
                                            id="ssh_private_key"
                                            value={data.ssh_private_key}
                                            onChange={e => setData('ssh_private_key', e.target.value)}
                                            rows={8}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 font-mono text-sm focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="-----BEGIN RSA PRIVATE KEY-----"
                                            required={authMethod === 'key'}
                                        />
                                        <p className="mt-1 text-sm text-gray-500">
                                            Paste your SSH private key content. Make sure it includes the BEGIN and END lines.
                                        </p>
                                        {errors.ssh_private_key && <p className="text-red-500 text-sm mt-1">{errors.ssh_private_key}</p>}
                                    </div>
                                )}

                                {/* SSH Password Field */}
                                {authMethod === 'password' && (
                                    <div>
                                        <label htmlFor="ssh_password" className="block text-sm font-medium text-gray-700">
                                            SSH Password *
                                        </label>
                                        <div className="mt-1 relative">
                                            <input
                                                type={showSshPassword ? "text" : "password"}
                                                id="ssh_password"
                                                value={data.ssh_password}
                                                onChange={e => setData('ssh_password', e.target.value)}
                                                className="block w-full border border-gray-300 rounded-md shadow-sm p-2 pr-10 focus:ring-blue-500 focus:border-blue-500"
                                                required={authMethod === 'password'}
                                            />
                                            <EyeIcon show={showSshPassword} setShow={setShowSshPassword} />
                                        </div>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Enter the SSH password for the user account.
                                        </p>
                                        {errors.ssh_password && <p className="text-red-500 text-sm mt-1">{errors.ssh_password}</p>}
                                    </div>
                                )}
                            </div>

                            {/* Port Configuration Section */}
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Port Configuration</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* HTTP Port */}
                                    <div>
                                        <label htmlFor="http_port" className="block text-sm font-medium text-gray-700">
                                            HTTP Port *
                                        </label>
                                        <input
                                            type="number"
                                            id="http_port"
                                            value={data.http_port}
                                            onChange={e => setData('http_port', parseInt(e.target.value))}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                            min="1"
                                            max="65535"
                                        />
                                        <p className="mt-1 text-sm text-gray-500">
                                            External HTTP port for web access
                                        </p>
                                        {errors.http_port && <p className="text-red-500 text-sm mt-1">{errors.http_port}</p>}
                                    </div>

                                    {/* HTTPS Port */}
                                    <div>
                                        <label htmlFor="https_port" className="block text-sm font-medium text-gray-700">
                                            HTTPS Port *
                                        </label>
                                        <input
                                            type="number"
                                            id="https_port"
                                            value={data.https_port}
                                            onChange={e => setData('https_port', parseInt(e.target.value))}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                            min="1"
                                            max="65535"
                                        />
                                        <p className="mt-1 text-sm text-gray-500">
                                            External HTTPS port for secure web access
                                        </p>
                                        {errors.https_port && <p className="text-red-500 text-sm mt-1">{errors.https_port}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* WordPress Admin Section */}
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">WordPress Admin</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* WordPress Admin User */}
                                    <div>
                                        <label htmlFor="wp_admin_user" className="block text-sm font-medium text-gray-700">
                                            Admin Username *
                                        </label>
                                        <input
                                            type="text"
                                            id="wp_admin_user"
                                            value={data.wp_admin_user}
                                            onChange={e => setData('wp_admin_user', e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        {errors.wp_admin_user && <p className="text-red-500 text-sm mt-1">{errors.wp_admin_user}</p>}
                                    </div>

                                    {/* WordPress Admin Email */}
                                    <div>
                                        <label htmlFor="wp_admin_email" className="block text-sm font-medium text-gray-700">
                                            Admin Email *
                                        </label>
                                        <input
                                            type="email"
                                            id="wp_admin_email"
                                            value={data.wp_admin_email}
                                            onChange={e => setData('wp_admin_email', e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        {errors.wp_admin_email && <p className="text-red-500 text-sm mt-1">{errors.wp_admin_email}</p>}
                                    </div>

                                    {/* WordPress Admin Password */}
                                    <div className="md:col-span-2">
                                        <label htmlFor="wp_admin_password" className="block text-sm font-medium text-gray-700">
                                            Admin Password *
                                        </label>
                                        <div className="mt-1 relative">
                                            <input
                                                type={showWpPassword ? "text" : "password"}
                                                id="wp_admin_password"
                                                value={data.wp_admin_password}
                                                onChange={e => setData('wp_admin_password', e.target.value)}
                                                className="block w-full border border-gray-300 rounded-md shadow-sm p-2 pr-10 focus:ring-blue-500 focus:border-blue-500"
                                                minLength={8}
                                            />
                                            <EyeIcon show={showWpPassword} setShow={setShowWpPassword} />
                                        </div>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Minimum 8 characters. This will be the WordPress administrator password.
                                        </p>
                                        {errors.wp_admin_password && <p className="text-red-500 text-sm mt-1">{errors.wp_admin_password}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => window.history.back()}
                                    className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition duration-150"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2 bg-blue-500 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition duration-150"
                                >
                                    {processing ? 'Updating Site...' : 'Update Site'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
