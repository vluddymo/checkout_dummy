'use client';

import React from 'react';
import { Price } from '@/lib/types';

interface PriceCardProps {
    price: Price;
    isSelected: boolean;
    onSelect: (price: Price) => void;
    index: number;
}

export default function PriceCard({ price, isSelected, onSelect, index }: PriceCardProps) {
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

    // Berechne den täglichen Preis, falls days in den Metadaten vorhanden ist
    const days = price.metadata?.days ? parseInt(price.metadata.days) : 30;
    const dailyRate = ((price.unit_amount) / days).toFixed(0);

    // Ist dies die zweite Karte?
    const isPopular = index === 1;

    return (
        <div className={`border rounded-lg p-6 cursor-pointer transition-all relative ${
            isSelected
                ? 'border border-[#6AD1DB] bg-[#6AD1DB]/10'
                : 'border-gray-200 hover:border-[#6AD1DB] hover:shadow-md'
        }`}
             onClick={() => onSelect(price)}
        >
            {/* Beliebtheits-Badge für die zweite Karte */}
            {isPopular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
          <span className="bg-[#6AD1DB] text-black uppercase text-sm font-semibold px-4 py-2 rounded-full">
            Am beliebtesten
          </span>
                </div>
            )}

            <div className="relative z-10 flex h-12 gap-1 rounded-md bg-[#565656] p-1 pl-0 font-semibold sm:h-14 float-right top-0">
                <div className="absolute -left-[14px] top-[6px] -z-10 h-[36px] w-[36px] rotate-45 rounded-md bg-[#565656] sm:-left-[17px] sm:top-[7px] sm:h-[42px] sm:w-[42px]"></div>
                <span className="pt-1 text-lg sm:pt-0.5 sm:text-2xl text-white">€</span>
                <div className="flex items-center gap-0.5">
                    <span className="text-3xl leading-none sm:text-5xl text-white">0</span>
                    <div className="flex flex-col pt-0.5">
                        <span className="text-sm leading-none sm:text-xl text-white">{dailyRate}</span>
                        <span className="whitespace-nowrap text-xs leading-none text-white/60 sm:leading-normal">pro Tag</span>
                    </div>
                </div>
            </div>

            <h3 className="font-bold text-xl">{price.nickname || 'Standard Plan'}</h3>
            <div className="mt-2 text-2xl font-bold">
                {formatAmount(price.unit_amount, price.currency)}
            </div>
            {price.recurring && (
                <div className="text-sm text-gray-400">
                    {formatInterval(price.recurring.interval, price.recurring.interval_count)}
                </div>
            )}

            <div className="mt-4 relative">
                <div className={`w-full py-2 px-4 rounded-md text-center ${
                    isSelected
                        ? 'bg-[#6AD1DB] border border-[#6AD1DB] text-black font-semibold'
                        : 'bg-white border border-[#6AD1DB] text-black'
                }`}>
                    {isSelected ? 'Ausgewählt' : 'Auswählen'}
                </div>
            </div>
        </div>
    );
}