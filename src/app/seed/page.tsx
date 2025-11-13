
"use client"
import { useState } from 'react';

export default function SeedPage() {
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');

    const handleSeed = async (): Promise<void> => {
        setLoading(true);
        setMessage('');
        
        try {
            const response = await fetch('/api/seed');
            const data = await response.json();
            
            if (response.ok) {
                setMessage(` ${data.message}`);
            } else {
                setMessage(`${data.error}`);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setMessage(` Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-4">Admin Seed</h1>
                <button
                    onClick={handleSeed}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
                >
                    {loading ? 'Seeding...' : 'Seed Admin User'}
                </button>
                {message && (
                    <p className="mt-4 p-2 bg-gray-100 rounded">{message}</p>
                )}
            </div>
        </div>
    );
}