import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function GET() {
    try {
        const product = await stripe.products.list({
            limit: 1,
            active: true,
        });

        if (product.data.length === 0) {
            return NextResponse.json({ error: 'No active products found' }, { status: 404 });
        }

        const productId = product.data[0].id;

        const prices = await stripe.prices.list({
            product: productId,
            active: true,
            expand: ['data.product']
        });

        const formattedPrices = prices.data.map((price) => ({
            id: price.id,
            nickname: price.nickname || product.data[0].name,
            unit_amount: price.unit_amount || 0,
            currency: price.currency,
            recurring: price.recurring ? {
                interval: price.recurring.interval,
                interval_count: price.recurring.interval_count,
            } : null,
            metadata: price.metadata || {},
        }));

        return NextResponse.json({ prices: formattedPrices });
    } catch (error) {
        console.error('Error fetching prices:', error);
        return NextResponse.json(
            { error: 'Failed to fetch prices' },
            { status: 500 }
        );
    }
}