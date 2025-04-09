'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const redirectStatus = searchParams.get('redirect_status');

    useEffect(() => {
        if (redirectStatus === 'failed') {
            // Redirect to a proper error page (optional: you could also show inline)
            router.replace('/checkout/canceled');
        }
    }, [redirectStatus, router]);

    if (redirectStatus === 'failed') {
        return null; // Don't show success UI if redirecting
    }

    return (
        <div className="container mx-auto max-w-lg  px-4 py-16 text-center">
            <div className="bg-[#333337] text-white rounded-lg shadow-lg p-8">
                <div className="mb-6 text-[#6AD1DB] flex justify-center">
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
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                </div>
                <h1 className="text-2xl font-bold mb-4">Vielen Dank für deinen Kauf!</h1>
                <p className="text-gray-200 mb-8">
                    Dein Abonnement wurde erfolgreich aktiviert.
                </p>
                <Link
                    href="/"
                    className="inline-block px-6 py-3 bg-[#6AD1DB] hover:bg-[#5bc4ce] text-black rounded-md transition-colors"
                >
                    Zum Dashboard
                </Link>
            </div>
        </div>
    );
}