import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { CustomerService } from "./customer.service";
import { sendResponse } from "../../shared/sendResponse";

import { CustomerQuery } from "./customer.interface";

const createCustomer = catchAsync(async (req: Request, res: Response) => {
    const result = await CustomerService.createCustomer(req.body);

    sendResponse(res, {
        httpStatusCode: 201,
        success: true,
        message: "Customer created successfully",
        data: result,
    });
});

const getAllCustomers = catchAsync(async (req: Request, res: Response) => {
    const result = await CustomerService.getAllCustomers(
        req.query as CustomerQuery,
    );

    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Customers fetched successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getCustomerById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await CustomerService.getCustomerById(id as string);

    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Customer fetched successfully",
        data: result,
    });
});

const updateCustomerById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await CustomerService.updateCustomerById(id as string, req.body);

    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Customer updated successfully",
        data: result,
    });
});

const deleteCustomerById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await CustomerService.deleteCustomerById(id as string);

    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Customer deleted successfully",
        data: result,
    });
});

export const CustomerController = {
    createCustomer,
    getAllCustomers,
    getCustomerById,
    updateCustomerById,
    deleteCustomerById,
};
