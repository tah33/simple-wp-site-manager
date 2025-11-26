import React from "react";
import AppLayout from "@/Layouts/AppLayout";

type LogItem = {
    timestamp: string;
    type: "info" | "success" | "error" | "warning";
    message: string;
    icon: string;
};

export default function Logs({ logs }: { logs: LogItem[] }) {
    return (
        <AppLayout title="Deployment Logs">
            <div className="mx-auto max-w-4xl py-8">
                <div className="bg-white shadow-sm rounded-lg p-6">
                    <h1 className="text-2xl font-bold mb-6">Deployment Logs</h1>

                    {/* TIMELINE CONTAINER with fixed height and scrollbar */}
                    <div className="relative border-l border-gray-300 pl-5 space-y-8 h-[600px] overflow-y-auto">
                        {logs.map((log, index) => (
                            <div key={index} className="relative flex items-start">
                                {/* Icon bubble on the left of timestamp */}
                                <div
                                    className={`
                                        flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full text-white text-xs mr-3
                                        ${
                                        log.type === "success"
                                            ? "bg-green-500"
                                            : log.type === "error"
                                                ? "bg-red-500"
                                                : log.type === "warning"
                                                    ? "bg-yellow-500"
                                                    : "bg-blue-500"
                                    }
                                    `}
                                >
                                    {/* Empty circle - no icon here anymore */}
                                </div>

                                {/* TIMELINE ITEM */}
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm flex-1">
                                    {/* Message */}
                                    <div className="flex items-center w-full">
                                        <div
                                            className={`
                                            text-sm
                                            ${
                                                log.type === "success"
                                                    ? "text-green-700"
                                                    : log.type === "error"
                                                        ? "text-red-700"
                                                        : log.type === "warning"
                                                            ? "text-yellow-700"
                                                            : "text-gray-800"
                                            }
                                        `}
                                            dangerouslySetInnerHTML={{
                                                __html: log.message,
                                            }}
                                        />
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Back Button */}
                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={() => history.back()}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
                        >
                            Back
                        </button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
