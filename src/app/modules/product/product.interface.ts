import { ProductCondition, ProductStatus } from "../../app/types/product";

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
