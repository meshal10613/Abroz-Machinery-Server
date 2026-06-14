import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { CustomerService } from "./customer.service";
import { sendResponse } from "../../shared/sendResponse";

const createCustomer = catchAsync(async (req: Request, res: Response) => {
    const result = await CustomerService.createCustomer(req.body);

    sendResponse(res, {
        httpStatusCode: 201,
        success: true,
        message: "Customer created successfully",
        data: result,
    });
});

export const CustomerController = { createCustomer };
