import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: Request) {
    try {
        const { priceId, email } = await request.json();

        if (!priceId) {
            return NextResponse.json(
                { error: 'Price ID is required' },
                { status: 400 }
            );
        }

        // Get price details
        const price = await stripe.prices.retrieve(priceId);

        // Create a PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: price.unit_amount || 0,
            currency: price.currency,
            metadata: {
                priceId,
                email,
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        return NextResponse.json(
            { error: 'Failed to create payment intent' },
            { status: 500 }
        );
    }
}