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
 * Send a batch of SMS messages via iSMS Malaysia.
 * Each entry in `recipients` can carry its own personalised body,
 * which is what we need when the message template contains [name].
 */
export const sendBulkSMS = async (recipients: SMSRecipient[]): Promise<any> => {
    if (recipients.length === 0) return [];

    try {
        const username = env.isms.username;
        const secretKey = env.isms.secretKey;
        const baseUrl = env.isms.baseUrl.replace(/\/$/, "");
        const apiUrl = `${baseUrl}/isms_send_json.php`;

        // iSMS JSON API allows a maximum of 50 destination numbers per single request
        const CHUNK_SIZE = 50;
        const chunks: SMSRecipient[][] = [];
        for (let i = 0; i < recipients.length; i += CHUNK_SIZE) {
            chunks.push(recipients.slice(i, i + CHUNK_SIZE));
        }

        const chunkPromises = chunks.map(async (chunk) => {
            // Detect if any message in this chunk contains non-ASCII characters to set type to Unicode (2)
            const hasUnicode = chunk.some((r) => /[^\x00-\x7F]/.test(r.body));
            const type = hasUnicode ? 2 : 1;

            const requestBody = {
                un: username,
                pwd: secretKey,
                type,
                agreedterm: "YES",
                messages: chunk.map((r) => ({
                    dstno: r.to,
                    msg: r.body,
                })),
            };

            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error("iSMS API HTTP Error response:", errorData);
                throw new AppError(
                    status.BAD_GATEWAY,
                    `iSMS API failed: HTTP ${response.status} (${response.statusText})`,
                );
            }

            const data = await response.json();

            // Verify if the gateway returned an error code
            if (data.code !== 2000 && data.status !== "success") {
                console.error("iSMS API Error payload:", data);
                throw new AppError(
                    status.BAD_GATEWAY,
                    `iSMS API failed: ${data.message || data.status || "Unknown error (code " + data.code + ")"}`,
                );
            }

            return data;
        });

        const results = await Promise.all(chunkPromises);
        return results.length === 1 ? results[0] : results;
    } catch (error: any) {
        console.error("Error sending iSMS:", error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(
            status.INTERNAL_SERVER_ERROR,
            error.message || "Failed to send iSMS",
        );
    }
};
