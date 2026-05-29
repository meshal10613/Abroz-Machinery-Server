import { Model } from "mongoose";

export interface QueryBuilderOptions<T> {
    model: Model<T>;
    query: Record<string, any>;
    searchFields?: (keyof T | string)[];
}

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface QueryResult<T> {
    data: T[];
    meta: PaginationMeta;
}
