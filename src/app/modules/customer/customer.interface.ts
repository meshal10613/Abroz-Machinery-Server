export interface CustomerQuery {
    search?: string;
    page?: string;
    limit?: string;
    sort?: string;
    order?: "asc" | "desc";
    fields?: string;
    name?: string;
    mobileNumber?: string;
}

export interface CreateCustomerInput {
    name: string;
    mobileNumber: string;
}

export interface UpdateCustomerInput {
    name?: string;
    mobileNumber?: string;
}