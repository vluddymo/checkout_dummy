// /app/api/create-subscription/route.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { parseErrorMessage } from '@/lib/errors';


export async function POST(request: Request) {
    try {
        const { customerId, priceId } = await request.json();

        if (!customerId || !priceId) {
            return NextResponse.json(
                { error: 'Customer ID and Price ID are required' },
                { status: 400 }
            );
        }

        console.log(`Creating subscription for customer ${customerId} with price ${priceId}`);

        // Create the subscription with the collection_method as 'send_invoice'
        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            payment_behavior: 'default_incomplete',
            payment_settings: { save_default_payment_method: 'on_subscription' },
            expand: ['latest_invoice'],
        });

        console.log(`Subscription created with ID: ${subscription.id}`);

        // After creating the subscription, create a payment intent
        // Get the price information for the payment intent
        const price = await stripe.prices.retrieve(priceId);

        // Create a payment intent linked to this customer and subscription
        const paymentIntent = await stripe.paymentIntents.create({
            amount: price.unit_amount || 0,
            currency: price.currency,
            customer: customerId,
            setup_future_usage: 'off_session',
            metadata: {
                subscription_id: subscription.id,
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        console.log(`Created payment intent: ${paymentIntent.id}`);

        // Return both the subscription ID and the payment intent client secret
        return NextResponse.json({
            subscriptionId: subscription.id,
            clientSecret: paymentIntent.client_secret,
        });

    } catch (error: unknown) {
        const message = parseErrorMessage(error);

        console.error('Error creating subscription:', error);
        console.error('Error message:', message);

        return NextResponse.json(
            {
                error: 'Failed to create subscription',
                message,
            },
            { status: 500 }
        );
    }
}