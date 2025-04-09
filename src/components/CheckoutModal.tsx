'use client';

import React, { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CheckoutModalProps, Price } from '@/lib/types';
import { parseErrorMessage } from '@/lib/errors';


const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);


function CheckoutForm({ price, email, onCloseAction }: { price: Price, email: string, onCloseAction: () => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | undefined>();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsLoading(true);
        setErrorMessage(undefined);

        try {
            const { error: submitError } = await elements.submit();
            if (submitError) {
                setErrorMessage(submitError.message);
                return;
            }

            const customerResponse = await fetch('/api/create-customer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (!customerResponse.ok) {
                throw new Error('Failed to create customer');
            }

            const { customerId } = await customerResponse.json();

            const subscriptionResponse = await fetch('/api/create-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerId,
                    priceId: price.id,
                }),
            });

            if (!subscriptionResponse.ok) {
                throw new Error('Failed to create subscription');
            }

            const { clientSecret, subscriptionId } = await subscriptionResponse.json();

            const { error: stripeError } = await stripe.confirmPayment({
                elements,
                clientSecret,
                confirmParams: {
                    return_url: `${window.location.origin}/checkout/success?subscription_id=${subscriptionId}`,
                },
            });

            if (stripeError) {
                console.error('Stripe payment error:', stripeError);
                setErrorMessage(stripeError.message ?? 'Zahlung fehlgeschlagen.');
                return;
            }

        } catch (error: unknown) {
            console.error('Payment error:', error);
            setErrorMessage(parseErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    const formatAmount = (amount: number, currency: string) => {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: currency.toUpperCase(),
        }).format(amount / 100);
    };

    const formatInterval = (interval: string, count: number) => {
        if (interval === 'month' && count === 1) return 'monatlich';
        if (interval === 'month' && count > 1) return `alle ${count} Monate`;
        if (interval === 'year' && count === 1) return 'jährlich';
        if (interval === 'year' && count > 1) return `alle ${count} Jahre`;
        return `${count} ${interval}`;
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="mb-6">
                <h3 className="text-lg font-bold mb-2">Zahlungsdetails</h3>
                <PaymentElement className="hover:border-[#6AD1DB]"/>
            </div>

            <div className="mb-6">
                <h3 className="text-lg font-bold mb-2">Zusammenfassung</h3>
                <div className="bg-gray-800 text-gray-200 p-4 rounded-md">
                    <div className="flex justify-between mb-2">
                        <span>{price.nickname || 'Abo'}</span>
                        <span>{formatAmount(price.unit_amount, price.currency)}</span>
                    </div>
                    {price.recurring && (
                        <div className="text-sm text-gray-400">
                            {formatInterval(price.recurring.interval, price.recurring.interval_count)}
                        </div>
                    )}
                    <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-bold">
                        <span>Gesamt</span>
                        <span>{formatAmount(price.unit_amount, price.currency)}</span>
                    </div>
                </div>
            </div>

            {errorMessage && (
                <div className="p-4 bg-red-50 text-red-700 rounded-md">
                    {errorMessage}
                </div>
            )}

            <div className="flex gap-3 justify-end">
                <button
                    type="button"
                    onClick={onCloseAction}
                    className="px-6 py-2 rounded-md border hover:text-black border-gray-300 hover:bg-gray-50 transition-colors"
                    disabled={isLoading}
                >
                    Abbrechen
                </button>
                <button
                    type="submit"
                    disabled={!stripe || isLoading}
                    className="px-6 py-2 bg-[#6AD1DB] hover:bg-[#0b8a96] text-black hover:text-white rounded-md disabled:opacity-70 transition-colors"
                >
                    {isLoading ? 'Wird bearbeitet...' : 'Jetzt kaufen'}
                </button>
            </div>
        </form>
    );
}

export default function CheckoutModal({ isOpen, onCloseAction, selectedPrice, email }: CheckoutModalProps) {
    const [clientSecret, setClientSecret] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && selectedPrice) {
            // Set up Payment Intent
            fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId: selectedPrice.id,
                    email,
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    setClientSecret(data.clientSecret);
                })
                .catch((err) => {
                    console.error('Error creating payment intent:', err);
                });
        }
    }, [isOpen, selectedPrice, email]);

    if (!isOpen || !selectedPrice) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#333337]  text-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Dein Kauf</h2>
                    <button
                        onClick={onCloseAction}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {clientSecret ? (
                    <Elements
                        stripe={stripePromise}
                        options={{
                            clientSecret,
                            appearance: {
                                theme: 'night', // Alternativen: 'stripe', 'night', 'flat', 'none'
                                variables: {
                                    colorPrimary: '#6AD1DB',
                                    colorBackground: '#333337',
                                    colorText: '#ffffff',
                                    colorDanger: '#EF4444', // Tailwind red-500
                                    fontFamily: 'Barlow, sans-serif',
                                    spacingUnit: '6px',
                                    borderRadius: '12px',
                                },
                                rules: {
                                    '.Input': {
                                        backgroundColor: '#1C1C1E',
                                        color: '#ffffff',
                                        border: '1px solid #6AD1DB',
                                        padding: '12px',
                                    },
                                    '.Input:focus': {
                                        borderColor: '#5bc4ce',
                                    },
                                    '.Label': {
                                        color: '#cccccc',
                                    },
                                },
                            },
                        }}
                    >
                        <CheckoutForm
                            price={selectedPrice}
                            email={email}
                            onCloseAction={onCloseAction}
                        />
                    </Elements>
                ) : (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6AD1DB]"></div>
                    </div>
                )}
            </div>
        </div>
    );
}
