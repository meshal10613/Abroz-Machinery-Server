import { sendBulkSMS, personalizeMessage } from "../../utils/sms";
import { logActivity } from "../../helper/activity.helper";
import AppError from "../../helper/AppError";
import { ActivityMethod } from "../../models/activity.model";
import Customer from "../../models/customer.model";
import BroadcastHistory from "../../models/broadcastHistory.model";
import { SendBroadcastInput } from "./broadcast.interface";
import status from "http-status";

const sendBroadcastToCustomers = async (payload: SendBroadcastInput) => {
    // Fetch both name and mobileNumber so we can personalise messages
    const customers = await Customer.find({
        _id: { $in: payload.customerIds },
    }).select("name mobileNumber");

    if (customers.length === 0) {
        throw new AppError(
            status.NOT_FOUND,
            "No customers found for the provided IDs",
        );
    }

    // Build one recipient object per customer.
    // If the message template contains [name], substitute it with the customer's
    // actual name; otherwise the message is sent as-is to every recipient.
    const recipients = customers
        .filter((c) => c.mobileNumber && c.mobileNumber.trim() !== "")
        .map((c) => ({
            to: c.mobileNumber,
            body: personalizeMessage(payload.message, c.name),
        }));

    if (recipients.length === 0) {
        throw new AppError(
            status.BAD_REQUEST,
            "Selected customers do not have valid mobile numbers",
        );
    }

    const startedAt = new Date();
    const batchName = payload.batchName || `Batch-${Date.now()}`;

    // 1. Create initial processing broadcast history record
    const broadcastRecord = await BroadcastHistory.create({
        batchName,
        message: payload.message, // store original template (with [name]) for reference
        totalRecipients: recipients.length,
        status: "processing",
        provider: "isms",
        startedAt,
    });

    try {
        // 2. Call iSMS API — each recipient gets their personalised message body
        const smsResult = await sendBulkSMS(recipients);

        // 3. Update history to completed
        broadcastRecord.status = "completed";
        broadcastRecord.successCount = recipients.length;
        broadcastRecord.failedCount = 0;
        broadcastRecord.apiResponse = smsResult;
        broadcastRecord.completedAt = new Date();
        await broadcastRecord.save();

        // 4. Log activity
        await logActivity(
            ActivityMethod.CREATE,
            `Sent iSMS broadcast "${batchName}" to ${recipients.length} recipients`,
        );

        return broadcastRecord;
    } catch (error: any) {
        // 5. Update history to failed
        broadcastRecord.status = "failed";
        broadcastRecord.successCount = 0;
        broadcastRecord.failedCount = recipients.length;
        broadcastRecord.apiResponse = { error: error.message || String(error) };
        broadcastRecord.completedAt = new Date();
        await broadcastRecord.save();

        throw error;
    }
};

export const BroadcastService = {
    sendBroadcastToCustomers,
};
