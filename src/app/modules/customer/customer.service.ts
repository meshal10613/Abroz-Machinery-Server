import { logActivity } from "../../helper/activity.helper";
import AppError from "../../helper/AppError";
import { ActivityMethod } from "../../models/activity.model";
import Customer from "../../models/customer.model";
import { CreateCustomerInput } from "./customer.interface";

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

export const CustomerService = {
    createCustomer,
};
