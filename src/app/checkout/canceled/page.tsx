'use client';

import Link from 'next/link';

export default function CanceledPage() {
    return (
        <div className="container mx-auto max-w-lg px-4 py-16 text-center">
            <div className="bg-[#333337] text-white rounded-lg shadow-lg p-8">
                <div className="mb-6 text-red-500 mx-auto">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="64"
                        height="64"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                </div>
                <h1 className="text-2xl font-bold mb-4">Zahlung fehlgeschlagen</h1>
                <p className="text-gray-200 mb-8">
                    Leider konnte deine Zahlung nicht verarbeitet werden. Bitte versuche es erneut.
                </p>
                <Link href="/" className="inline-block px-6 py-3 bg-[#6AD1DB] hover:bg-[#5bc4ce] text-black rounded-md transition-colors">
                    Zurück zur Paywall
                </Link>
            </div>
        </div>
    );
}
