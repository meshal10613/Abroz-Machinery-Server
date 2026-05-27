import { Model, PopulateOptions, QueryFilter } from "mongoose";
import { QueryBuilderOptions, QueryResult } from "../types/query";

export class QueryBuilder<T> {
    private model: Model<T>;
    private query: Record<string, any>;
    private searchFields: (keyof T | string)[];
    private filterConditions: QueryFilter<T> = {};
    private populateOptions: PopulateOptions[] = [];
    private selectFields = "";

    constructor({ model, query, searchFields = [] }: QueryBuilderOptions<T>) {
        this.model = model;
        this.query = query;
        this.searchFields = searchFields;
    }

    search(): this {
        const searchTerm = this.query.search;

        if (searchTerm && this.searchFields.length > 0) {
            this.filterConditions.$or = this.searchFields.map((field) => ({
                [field]: {
                    $regex: searchTerm,
                    $options: "i",
                },
            })) as QueryFilter<T>["$or"];
        }

        return this;
    }

    filter(excludeFields: string[] = []): this {
        const reserved = [
            "search",
            "sort",
            "order",
            "page",
            "limit",
            "fields",
            ...excludeFields,
        ];

        const rawFilters: Record<string, any> = { ...this.query };

        reserved.forEach((key) => delete rawFilters[key]);

        const rangeFilters: Record<string, any> = {};

        Object.entries(rawFilters).forEach(([key, value]) => {
            if (key.startsWith("min")) {
                const field = key.charAt(3).toLowerCase() + key.slice(4);

                rangeFilters[field] = {
                    ...rangeFilters[field],
                    $gte: Number(value),
                };

                delete rawFilters[key];
            } else if (key.startsWith("max")) {
                const field = key.charAt(3).toLowerCase() + key.slice(4);

                rangeFilters[field] = {
                    ...rangeFilters[field],
                    $lte: Number(value),
                };

                delete rawFilters[key];
            }
        });

        this.filterConditions = {
            ...this.filterConditions,
            ...rawFilters,
            ...rangeFilters,
        } as QueryFilter<T>;

        return this;
    }

    populate(
        options: string | PopulateOptions | (string | PopulateOptions)[],
    ): this {
        const normalized = Array.isArray(options) ? options : [options];

        this.populateOptions.push(
            ...normalized.map((item) =>
                typeof item === "string" ? { path: item } : item,
            ),
        );

        return this;
    }

    fields(): this {
        if (this.query.fields) {
            this.selectFields = this.query.fields.split(",").join(" ");
        }

        return this;
    }

    async paginate(): Promise<QueryResult<T>> {
        const page = Math.max(1, parseInt(this.query.page) || 1);
        const limit = Math.min(
            100,
            Math.max(1, parseInt(this.query.limit) || 10),
        );

        const skip = (page - 1) * limit;

        const sortField = this.query.sort || "createdAt";
        const sortOrder = this.query.order === "asc" ? 1 : -1;

        let dbQuery = this.model
            .find(this.filterConditions)
            .sort({ [sortField]: sortOrder })
            .skip(skip)
            .limit(limit);

        if (this.selectFields) {
            dbQuery = dbQuery.select(this.selectFields);
        }

        for (const pop of this.populateOptions) {
            dbQuery = dbQuery.populate(pop) as typeof dbQuery;
        }

        const [data, total] = await Promise.all([
            dbQuery.lean().exec(),
            this.model.countDocuments(this.filterConditions),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            data: data as T[],
            meta: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    }

    async exec(): Promise<T[]> {
        const sortField = this.query.sort || "createdAt";
        const sortOrder = this.query.order === "asc" ? 1 : -1;

        let dbQuery = this.model
            .find(this.filterConditions)
            .sort({ [sortField]: sortOrder });

        if (this.selectFields) {
            dbQuery = dbQuery.select(this.selectFields);
        }

        for (const pop of this.populateOptions) {
            dbQuery = dbQuery.populate(pop) as typeof dbQuery;
        }

        return dbQuery.lean().exec() as Promise<T[]>;
    }
}

//? For populate options, you can use it like this:
// 1-> .populate("categoryId")

// 2-> .populate({
//     path: "categoryId",
//     select: "name",
// })

// 3-> .populate([
//     "categoryId",
//     {
//         path: "userId",
//         select: "name email",
//     },
// ])
