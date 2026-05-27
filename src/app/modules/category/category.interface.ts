export interface CategoryQuery {
    search?: string;
    page?: string;
    limit?: string;
    sort?: string;
    order?: "asc" | "desc";
    fields?: string;
    name?: string;
}

export interface CreateCategoryInput {
    name: string;
    description?: string;
}

export interface UpdateCategoryInput {
    name?: string;
    description?: string;
}
