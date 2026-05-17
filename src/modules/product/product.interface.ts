export interface CreateProductInput {
    name: string;
    description: string;
    image: string;
    categoryId: string;
    price: number;
    salePrice?: number;
    onSale?: boolean;
    quantity?: number;
    brand?: string;
    features?: string[];
}

export interface UpdateProductInput {
    name?: string;
    description?: string;
    image?: string;
    categoryId?: string;
    price?: number;
    salePrice?: number;
    onSale?: boolean;
    quantity?: number;
    brand?: string;
    features?: string[];
}
