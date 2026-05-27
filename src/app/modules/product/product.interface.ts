import { ProductCondition, ProductStatus } from "../../types/product";

export interface CreateProductInput {
    name: string;
    origin?: string;
    partNumber?: string;
    brandName?: string;
    quantity: number;
    categoryId: string;
    condition: ProductCondition;
    compatibility?: string;
    description: string;
    features?: string[];
    shippingInfo?: string;
    conditionNotes?: string;
    images?: string[];
    status?: ProductStatus;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {}

export interface ProductsQuery {
    search?: string;
    categoryId?: string;
    status?: string;
    page?: string;
    limit?: string;
}