import './globals.css';
import type { Metadata } from 'next';
import { Barlow } from 'next/font/google';
import React from "react";

const barlow = Barlow({
    weight: ['300', '500', '700'],
    subsets: ['latin'],
});
export const metadata: Metadata = {
    title: 'MyFitCoach - Checkout',
    description: 'Complete your purchase to access MyFitCoach',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body className={barlow.className}>
        <main className="min-h-screen bg-black">{children}</main>
        </body>
        </html>
    );
}