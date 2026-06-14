import { QueryBuilder } from "../../builder/queryBuilder";
import { logActivity } from "../../helper/activity.helper";
import AppError from "../../helper/AppError";
import { ActivityMethod } from "../../models/activity.model";
import Customer from "../../models/customer.model";
import {
    CreateCustomerInput,
    CustomerQuery,
    UpdateCustomerInput,
} from "./customer.interface";

const createCustomer = async (payload: CreateCustomerInput) => {
    const existing = await Customer.findOne({
        mobileNumber: payload.mobileNumber,
    });

    if (existing) {
        throw new AppError(409, "Customer already exists");
    }

    const customer = await Customer.create(payload);

    await logActivity(
        ActivityMethod.CREATE,
        `Created customer: ${customer.name}`,
    );

    return customer;
};

const getAllCustomers = async (query: CustomerQuery) => {
    const result = await new QueryBuilder({
        model: Customer,
        query,
        searchFields: ["name", "mobileNumber"],
    })
        .search()
        .filter()
        .fields()
        .paginate();

    return result;
};

const getCustomerById = async (id: string) => {
    const customer = await Customer.findById(id);

    if (!customer) {
        throw new AppError(404, "Customer not found");
    }

    return customer;
};

const updateCustomerById = async (id: string, payload: UpdateCustomerInput) => {
    const customer = await Customer.findById(id);

    if (!customer) {
        throw new AppError(404, "Customer not found");
    }

    if (payload.mobileNumber) {
        const existing = await Customer.findOne({
            mobileNumber: payload.mobileNumber,
            _id: { $ne: id },
        });

        if (existing) {
            throw new AppError(409, "Customer with this mobile number already exists");
        }
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(id, payload, {
        new: true,
    });

    if (!updatedCustomer) {
        throw new AppError(404, "Customer not found");
    }

    await logActivity(
        ActivityMethod.UPDATE,
        `Updated customer: ${updatedCustomer.name}`,
    );

    return updatedCustomer;
};

const deleteCustomerById = async (id: string) => {
    const customer = await Customer.findById(id);

    if (!customer) {
        throw new AppError(404, "Customer not found");
    }

    await Customer.findByIdAndDelete(id);

    await logActivity(
        ActivityMethod.DELETE,
        `Deleted customer: ${customer.name}`,
    );

    return {
        message: "Customer deleted successfully",
    };
};

export const CustomerService = {
    createCustomer,
    getAllCustomers,
    getCustomerById,
    updateCustomerById,
    deleteCustomerById,
};
