import { useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';

type RouteParams = Record<string, string | number> | string | number;
declare const route: (name: string, params?: RouteParams) => string;
type AuthMethod = 'password';

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
export default function Create() {
    const [authMethod] = useState<AuthMethod>('password');
    const [showWpPassword, setShowWpPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        domain: '',
        server_ip: '',
        server_port: 22,
        server_username: 'root',
        auth_method: 'password',
        ssh_password: '',
        ssh_private_key: '',
        http_port: 8080,
        wp_admin_user: 'admin',
        wp_admin_password: '',
        wp_admin_email: '',
    });
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Prepare the data to send - remove auth_method and handle auth fields properly
        const submitData = { ...data };

        // Ensure only the relevant auth field is sent based on the selected method
        if (authMethod === 'password') {
            // Remove ssh_private_key when using password auth
            submitData.ssh_private_key = '';
        } else {
            // Remove ssh_password when using key auth
            submitData.ssh_password = '';
        }

        // Pass the data to the post method
        // @ts-ignore
        post(route('sites.store'), submitData);
    };

    return (
        <AppLayout title="Create WordPress Site">
            <div className="mx-auto max-w-4xl py-6 sm:px-6 lg:px-8">
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                    <div className="border-b border-gray-200 bg-white p-6">
                        <h1 className="mb-6 text-2xl font-bold">Create New WordPress Site</h1>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Basic Information Section */}
                            <div>
                                <h2 className="mb-4 text-lg font-semibold text-gray-900">Basic Information</h2>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {/* Domain */}
                                    <div>
                                        <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
                                            Domain Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="domain"
                                            value={data.domain}
                                            onChange={(e) => setData('domain', e.target.value)}
                                            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="example.com"
                                        />
                                        {errors.domain && <p className="mt-1 text-sm text-red-500">{errors.domain}</p>}
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
                                            onChange={(e) => setData('server_ip', e.target.value)}
                                            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="192.168.1.100"
                                        />
                                        {errors.server_ip && <p className="mt-1 text-sm text-red-500">{errors.server_ip}</p>}
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
                                            onChange={(e) => setData('server_port', parseInt(e.target.value))}
                                            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            min="1"
                                            max="65535"
                                        />
                                        {errors.server_port && <p className="mt-1 text-sm text-red-500">{errors.server_port}</p>}
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
                                            onChange={(e) => setData('server_username', e.target.value)}
                                            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                        {errors.server_username && <p className="mt-1 text-sm text-red-500">{errors.server_username}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* SSH Authentication Section */}
                            <div>
                                <h2 className="mb-4 text-lg font-semibold text-gray-900">SSH Authentication</h2>

                                {/* Authentication Method Selection */}
                                {/*<div className="mb-6">
                                    <label className="mb-3 block text-sm font-medium text-gray-700">Authentication Method *</label>
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
                                </div>*/}

                                {/* SSH Private Key Field */}
                              {/*  {authMethod === 'key' && (
                                    <div>
                                        <label htmlFor="ssh_private_key" className="block text-sm font-medium text-gray-700">
                                            SSH Private Key *
                                        </label>
                                        <textarea
                                            id="ssh_private_key"
                                            value={data.ssh_private_key}
                                            onChange={(e) => setData('ssh_private_key', e.target.value)}
                                            rows={8}
                                            className="mt-1 block w-full rounded-md border border-gray-300 p-2 font-mono text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="-----BEGIN RSA PRIVATE KEY-----"
                                            required={authMethod === 'key'}
                                        />
                                        <p className="mt-1 text-sm text-gray-500">
                                            Paste your SSH private key content. Make sure it includes the BEGIN and END lines.
                                        </p>
                                        {errors.ssh_private_key && <p className="mt-1 text-sm text-red-500">{errors.ssh_private_key}</p>}
                                    </div>
                                )}*/}

                                {/* SSH Password Field */}
                                {authMethod === 'password' && (
                                    <div>
                                        <label htmlFor="ssh_password" className="block text-sm font-medium text-gray-700">
                                            SSH Password *
                                        </label>
                                        <input
                                            type="password"
                                            id="ssh_password"
                                            value={data.ssh_password}
                                            onChange={(e) => setData('ssh_password', e.target.value)}
                                            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                        <p className="mt-1 text-sm text-gray-500">Enter the SSH password for the user account.</p>
                                        {errors.ssh_password && <p className="mt-1 text-sm text-red-500">{errors.ssh_password}</p>}
                                    </div>
                                )}
                            </div>

                            {/* Port Configuration Section */}
                            <div>
                                <h2 className="mb-4 text-lg font-semibold text-gray-900">Port Configuration</h2>
                                <div className="grid grid-cols-1 gap-6">
                                    {/* HTTP Port */}
                                    <div>
                                        <label htmlFor="http_port" className="block text-sm font-medium text-gray-700">
                                            HTTP Port *
                                        </label>
                                        <input
                                            type="number"
                                            id="http_port"
                                            value={data.http_port}
                                            onChange={(e) => setData('http_port', parseInt(e.target.value))}
                                            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            min="1"
                                            max="65535"
                                        />
                                        <p className="mt-1 text-sm text-gray-500">External HTTP port for web access</p>
                                        {errors.http_port && <p className="mt-1 text-sm text-red-500">{errors.http_port}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* WordPress Admin Section */}
                            <div>
                                <h2 className="mb-4 text-lg font-semibold text-gray-900">WordPress Admin</h2>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {/* WordPress Admin User */}
                                    <div>
                                        <label htmlFor="wp_admin_user" className="block text-sm font-medium text-gray-700">
                                            Admin Username *
                                        </label>
                                        <input
                                            type="text"
                                            id="wp_admin_user"
                                            value={data.wp_admin_user}
                                            onChange={(e) => setData('wp_admin_user', e.target.value)}
                                            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                        {errors.wp_admin_user && <p className="mt-1 text-sm text-red-500">{errors.wp_admin_user}</p>}
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
                                            onChange={(e) => setData('wp_admin_email', e.target.value)}
                                            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                        {errors.wp_admin_email && <p className="mt-1 text-sm text-red-500">{errors.wp_admin_email}</p>}
                                    </div>

                                    {/* WordPress Admin Password */}
                                    <div className="md:col-span-2">
                                        <label htmlFor="wp_admin_password" className="block text-sm font-medium text-gray-700">
                                            Admin Password *
                                        </label>
                                        <div className="relative mt-1">
                                            <input
                                                type={showWpPassword ? 'text' : 'password'}
                                                id="wp_admin_password"
                                                value={data.wp_admin_password}
                                                onChange={(e) => setData('wp_admin_password', e.target.value)}
                                                className="block w-full rounded-md border border-gray-300 p-2 pr-10 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                minLength={8}
                                            />
                                            <EyeIcon show={showWpPassword} setShow={setShowWpPassword} />
                                        </div>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Minimum 8 characters. This will be the WordPress administrator password.
                                        </p>
                                        {errors.wp_admin_password && <p className="mt-1 text-sm text-red-500">{errors.wp_admin_password}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex justify-end space-x-4 border-t border-gray-200 pt-6">
                                <button
                                    type="button"
                                    onClick={() => window.history.back()}
                                    className="rounded-md border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 transition duration-150 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-md border border-transparent bg-blue-500 px-6 py-2 text-sm font-medium text-white transition duration-150 hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
                                >
                                    {processing ? 'Creating Site...' : 'Create Site'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
