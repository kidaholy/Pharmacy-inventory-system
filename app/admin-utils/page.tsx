'use client';

import { useState } from 'react';

export default function AdminUtilsPage() {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any>(null);

    const handleSeedData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/seed-data', { method: 'POST' });
            const data = await response.json();
            setResults(data);
        } catch (error) {
            setResults({ error: 'Failed to seed data' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddLogos = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/test-logos', { method: 'POST' });
            const data = await response.json();
            setResults(data);
        } catch (error) {
            setResults({ error: 'Failed to add logos' });
        } finally {
            setLoading(false);
        }
    };

    const handleCheckStats = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/stats');
            const data = await response.json();
            setResults(data);
        } catch (error) {
            setResults({ error: 'Failed to fetch stats' });
        } finally {
            setLoading(false);
        }
    };

    const handleCheckData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/seed-data');
            const data = await response.json();
            setResults(data);
        } catch (error) {
            setResults({ error: 'Failed to check data' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-8">Admin Utilities</h1>
                    <p className="text-slate-600 mb-8">
                        Use these utilities to seed sample data and test the real-time statistics functionality.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <button
                            onClick={handleSeedData}
                            disabled={loading}
                            className="bg-medi-green hover:bg-medi-green/90 text-white px-6 py-4 rounded-xl font-semibold transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Seed Sample Data'}
                        </button>

                        <button
                            onClick={handleAddLogos}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-semibold transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Add Test Logos'}
                        </button>

                        <button
                            onClick={handleCheckStats}
                            disabled={loading}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-xl font-semibold transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Check Current Stats'}
                        </button>

                        <button
                            onClick={handleCheckData}
                            disabled={loading}
                            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-4 rounded-xl font-semibold transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Check Data Status'}
                        </button>
                    </div>

                    {results && (
                        <div className="bg-slate-50 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Results:</h3>
                            <pre className="text-sm text-slate-700 overflow-auto">
                                {JSON.stringify(results, null, 2)}
                            </pre>
                        </div>
                    )}

                    <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
                        <h3 className="text-lg font-bold text-blue-900 mb-3">Instructions:</h3>
                        <ol className="list-decimal list-inside space-y-2 text-blue-800">
                            <li><strong>Seed Sample Data:</strong> Adds sample medicines and prescriptions to existing tenants</li>
                            <li><strong>Add Test Logos:</strong> Adds sample logo images to tenants that don't have logos</li>
                            <li><strong>Check Current Stats:</strong> Shows the real-time statistics that will appear on the landing page</li>
                            <li><strong>Check Data Status:</strong> Shows current counts of tenants, users, medicines, and prescriptions</li>
                        </ol>
                        <p className="mt-4 text-sm text-blue-700">
                            After running these utilities, visit the main landing page to see the real statistics in action!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}