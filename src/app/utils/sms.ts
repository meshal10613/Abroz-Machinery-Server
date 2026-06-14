import status from "http-status";
import { env } from "../config/env";
import AppError from "../helper/AppError";

/** Replace template placeholders like [name] with actual customer values. */
export const personalizeMessage = (template: string, name: string): string => {
    return template.replace(/\[name\]/gi, name);
};

/** Returns true if the message template contains at least one [name] placeholder. */
export const hasNamePlaceholder = (message: string): boolean => {
    return /\[name\]/i.test(message);
};

interface SMSRecipient {
    to: string;
    body: string;
}

/**
 * Send a batch of SMS messages via BulkSMS.
 * Each entry in `recipients` can carry its own personalised body,
 * which is what we need when the message template contains [name].
 */
export const sendBulkSMS = async (recipients: SMSRecipient[]): Promise<any> => {
    if (recipients.length === 0) return [];

    try {
        const username = env.bulkSMS.id;
        const password = env.bulkSMS.secret;
        const baseUrl = env.bulkSMS.url.replace(/\/$/, "");

        const credentials = Buffer.from(`${username}:${password}`).toString(
            "base64",
        );

        const response = await fetch(`${baseUrl}/messages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${credentials}`,
            },
            body: JSON.stringify(recipients),
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error("BulkSMS API Error response:", errorData);
            throw new AppError(
                status.BAD_GATEWAY,
                `BulkSMS API failed: ${response.statusText} (${response.status})`,
            );
        }

        const data = await response.json();
        return data;
    } catch (error: any) {
        console.error("Error sending BulkSMS:", error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(
            status.INTERNAL_SERVER_ERROR,
            error.message || "Failed to send BulkSMS",
        );
    }
};
