export interface Price {
    id: string;
    nickname: string;
    unit_amount: number;
    currency: string;
    recurring: {
        interval: string;
        interval_count: number;
    } | null;
    metadata: {
        days?: string;
        [key: string]: string | undefined;
    };
}

export interface CheckoutModalProps {
    isOpen: boolean;
    onCloseAction: () => void;
    selectedPrice: Price | null;
    email: string;
}