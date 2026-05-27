import { Query } from "mongoose";

export class QueryBuilder<T> {
    constructor(
        public modelQuery: Query<T[], T>,
        public query: Record<string, any>,
    ) {}

    search(fields: string[]) {
        const searchTerm = this.query.searchTerm;

        if (searchTerm) {
            this.modelQuery = this.modelQuery.find({
                $or: fields.map((field) => ({
                    [field]: {
                        $regex: searchTerm,
                        $options: "i",
                    },
                })),
            });
        }

        return this;
    }

    filter() {
        const queryObj = { ...this.query };

        const excludeFields = [
            "searchTerm",
            "page",
            "limit",
            "sortBy",
            "sortOrder",
        ];

        excludeFields.forEach((el) => delete queryObj[el]);

        this.modelQuery = this.modelQuery.find(queryObj);

        return this;
    }

    sort() {
        const sortBy = this.query.sortBy || "createdAt";
        const sortOrder = this.query.sortOrder === "asc" ? "" : "-";

        this.modelQuery = this.modelQuery.sort(`${sortOrder}${sortBy}`);

        return this;
    }

    paginate() {
        const page = Number(this.query.page) || 1;
        const limit = Number(this.query.limit) || 10;

        const skip = (page - 1) * limit;

        this.modelQuery = this.modelQuery.skip(skip).limit(limit);

        return this;
    }

    async countTotal() {
        const queryObj = { ...this.query };

        ["searchTerm", "page", "limit", "sortBy", "sortOrder"].forEach(
            (field) => delete queryObj[field],
        );

        const total = await this.modelQuery.model.countDocuments(queryObj);

        return {
            page: Number(this.query.page) || 1,
            limit: Number(this.query.limit) || 10,
            total,
            totalPages: Math.ceil(total / (Number(this.query.limit) || 10)),
        };
    }
}
