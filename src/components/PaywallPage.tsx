'use client';

import { useState, useEffect } from 'react';
import { Price } from '@/lib/types';
import PriceCard from './PriceCard';
import CheckoutModal from './CheckoutModal';
import Image from 'next/image';

export default function PaywallPage() {
    const [email, setEmail] = useState('');
    const [prices, setPrices] = useState<Price[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPrice, setSelectedPrice] = useState<Price | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [emailError, setEmailError] = useState('');

    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const response = await fetch('/api/get-prices');
                if (!response.ok) throw new Error('Failed to fetch prices');
                const data = await response.json();
                setPrices(data.prices);
            } catch (error) {
                console.error('Error fetching prices:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPrices();
    }, []);

    const handleContinue = () => {
        if (!email) {
            setEmailError('Bitte gib deine E-Mail-Adresse ein');
            return;
        }

        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            setEmailError('Bitte gib eine gültige E-Mail-Adresse ein');
            return;
        }

        if (!selectedPrice) return;

        setEmailError('');
        setIsModalOpen(true);
    };

    return (
        <div className="w-full max-w-screen-xl mx-auto px-4 py-8 bg-black">
            <div className="flex flex-col justify-center">
                <header className="text-center mb-8">
                    <Image
                        src="/images/Mfc_logo.webp"
                        alt="logo"
                        width="160"
                        height="24"
                        priority
                        style={{ width: '160px', height: 'auto' }}
                        className="mx-auto mb-4"
                    />
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                        Premium-Abo
                    </h1>
                    <p className="text-white text-base sm:text-lg">
                        Wähle dein Abo-Modell und starte dein personalisiertes Fitnesstraining.
                    </p>
                </header>

                <div className="bg-[#1C1C1E] text-white rounded-lg shadow-lg p-6 sm:p-8">
                    <h2 className="text-xl font-bold mb-6">Deine E-Mail-Adresse</h2>
                    <div className="mb-8">
                        <input
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            placeholder="deine@email.de"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (emailError) setEmailError('');
                            }}
                            className={`w-full p-3 border text-white ${
                                emailError ? 'border-red-500' : 'border-gray-300'
                            } rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6AD1DB]`}
                        />
                        {emailError && (
                            <p className="text-red-500 text-sm mt-1">{emailError}</p>
                        )}
                    </div>

                    <h2 className="text-xl font-bold mb-6">Wähle dein Abo</h2>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6AD1DB]"></div>
                        </div>
                    ) : prices.length === 0 ? (
                        <div className="text-center p-8 text-gray-500">
                            Keine Abonnements verfügbar.
                        </div>
                    ) : (
                        <div className="grid gap-6 mb-8  lg:grid-cols-3">
                            {prices.map((price, index) => (
                                <PriceCard
                                    key={price.id}
                                    price={price}
                                    index={index}
                                    isSelected={selectedPrice?.id === price.id}
                                    onSelect={setSelectedPrice}
                                />
                            ))}
                        </div>
                    )}

                    <div className="mt-8">
                        <button
                            type="button"
                            onClick={handleContinue}
                            disabled={!selectedPrice || !email}
                            className="w-full py-3 px-6 bg-[#6AD1DB] hover:bg-[#5bc4ce] text-black font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Weiter zum Checkout
                        </button>
                    </div>
                </div>

                <footer className="text-white text-center mt-16 py-10">
                    <div className="mb-4">
                        <Image
                            src="/images/logo_footer.webp"
                            alt="logo"
                            width={160}
                            height={24}
                            priority
                            style={{ width: '160px', height: 'auto' }}
                            className="mx-auto"
                        />
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        &copy; {new Date().getFullYear()} MyFitCoach GmbH<br />
                        Alle Rechte vorbehalten.
                    </p>
                </footer>
            </div>

            <CheckoutModal
                isOpen={isModalOpen}
                onCloseAction={() => setIsModalOpen(false)}
                selectedPrice={selectedPrice}
                email={email}
            />
        </div>
    );
}