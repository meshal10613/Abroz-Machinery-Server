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

export interface SMSSendResult {
    to: string;
    raw: string;
    code: number | null;
    success: boolean;
    errorDescription?: string;
}

export interface SendBulkSMSResult {
    results: SMSSendResult[];
    successCount: number;
    failedCount: number;
    raw: any;
}

// Per https://www.isms.com.my/sms-api-documentation.php (JSON API v2.1)
const ISMS_ERROR_CODES: Record<number, string> = {
    [-1000]: "UNKNOWN ERROR",
    [-1001]: "AUTHENTICATION FAILED",
    [-1002]: "ACCOUNT SUSPENDED / EXPIRED",
    [-1003]: "IP NOT ALLOWED",
    [-1004]: "INSUFFICIENT CREDITS",
    [-1005]: "INVALID SMS TYPE",
    [-1006]: "INVALID BODY LENGTH (1-900)",
    [-1007]: "INVALID HEX BODY",
    [-1008]: "MISSING PARAMETER (or invalid destination number)",
    [-1009]: "INVALID MESSAGE CONTENT (filtered / prohibited content)",
    [-1010]: "MAXIMUM DESTINATION NUMBERS EXCEEDED (50 per request)",
    [-1012]: "INVALID MESSAGE TYPE (use type=2 for Unicode)",
    [-1013]: "INVALID TERM AND AGREEMENT (agreedterm=YES required)",
    [-1014]: "INVALID JSON FORMAT",
    [-1015]: "INVALID REQUEST METHOD (POST only)",
};

/** Shape of a single recipient's outcome inside the JSON API's `results` array. */
interface IsmsResultEntry {
    dstno: string;
    code: number;
    status: string;
    sms_id?: string;
}

/** Shape of the top-level response from POST /isms_send_json.php */
interface IsmsJsonResponse {
    status: "success" | "partial" | "error";
    code: number;
    message: string;
    total_messages?: number;
    total_success?: number;
    total_failed?: number;
    total_credits_used?: number;
    results?: IsmsResultEntry[];
}

/**
 * Parse the response for one chunk of recipients.
 *
 * iSMS's JSON API returns ONE object per request, not one entry per
 * recipient at the top level:
 *   - On success/partial: { status, code: 2000, results: [{ dstno, code, status, sms_id }, ...] }
 *     — `results` has exactly one entry per recipient, in request order.
 *   - On a total rejection (bad auth, no credits, IP not whitelisted, bad
 *     agreedterm, etc.): { status: "error", code: <negative>, message }
 *     — there is NO `results` array at all; the error applies to every
 *     recipient in the chunk.
 */
const parseIsmsChunkResponse = (
    data: unknown,
    chunk: SMSRecipient[],
): SMSSendResult[] => {
    const response =
        data && typeof data === "object" ? (data as IsmsJsonResponse) : null;

    // Total rejection: no per-recipient results, one error covers the whole chunk.
    if (!response || !Array.isArray(response.results)) {
        const raw =
            typeof data === "string" ? data : JSON.stringify(data ?? null);
        const code = Number(response?.code ?? NaN);
        const errorDescription =
            (!Number.isNaN(code) ? ISMS_ERROR_CODES[code] : undefined) ??
            response?.message ??
            (raw.trim() ? raw : "Unknown error");

        return chunk.map((r) => ({
            to: r.to,
            raw,
            code: Number.isNaN(code) ? null : code,
            success: false,
            errorDescription,
        }));
    }

    // Normal case: map each recipient to its own result, by position
    // (iSMS returns `results` in the same order the `messages` were sent).
    return chunk.map((r, i) => {
        const entry = response.results![i];

        if (!entry) {
            return {
                to: r.to,
                raw: "NO RESULT RETURNED",
                code: null,
                success: false,
                errorDescription:
                    "iSMS did not return a result for this recipient",
            };
        }

        const code = Number(entry.code);
        const success = code === 2000;

        return {
            to: r.to,
            raw: entry.status ?? String(entry.code),
            code: Number.isNaN(code) ? null : code,
            success,
            errorDescription: success
                ? undefined
                : (ISMS_ERROR_CODES[code] ?? entry.status ?? "Unknown error"),
        };
    });
};

/**
 * Send a batch of SMS messages via iSMS Malaysia.
 * Each entry in `recipients` can carry its own personalised body,
 * which is what we need when the message template contains [name].
 */
export const sendBulkSMS = async (
    recipients: SMSRecipient[],
): Promise<SendBulkSMSResult> => {
    if (recipients.length === 0) {
        return { results: [], successCount: 0, failedCount: 0, raw: [] };
    }

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

            // Per the JSON API spec, un/pwd/type/agreedterm/sendid are all
            // strings (not numbers) at the top level.
            const requestBody = {
                un: username,
                pwd: secretKey,
                type: String(type),
                agreedterm: "YES",
                ...(env.isms.sendId ? { sendid: env.isms.sendId } : {}),
                messages: chunk.map((r) => ({
                    // International format, no leading "+".
                    dstno: r.to.replace(/^\+/, ""),
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

            // iSMS doesn't always return valid JSON (a top-level auth/param error
            // can come back as a bare string), so parse defensively.
            const rawText = await response.text();
            let data: any;
            try {
                data = JSON.parse(rawText);
            } catch {
                data = rawText;
            }

            // The JSON API returns ONE object per request: on success/partial it
            // has a `results` array (one entry per recipient, same order as sent);
            // on a total rejection (bad auth, no credits, IP not whitelisted...)
            // there's no `results` array and the error applies to the whole chunk.
            const parsed: SMSSendResult[] = parseIsmsChunkResponse(data, chunk);

            console.log(
                `iSMS chunk of ${chunk.length}: ${parsed.filter((p) => p.success).length} succeeded, ${parsed.filter((p) => !p.success).length} failed. Raw: ${rawText}`,
            );

            return { parsed, raw: data };
        });

        const chunkResults = await Promise.all(chunkPromises);

        const results = chunkResults.flatMap((c) => c.parsed);
        const raw =
            chunkResults.length === 1
                ? chunkResults[0].raw
                : chunkResults.map((c) => c.raw);
        const successCount = results.filter((r) => r.success).length;
        const failedCount = results.length - successCount;

        // Only throw (marking the whole broadcast "failed") if every single
        // message failed — e.g. bad credentials or no credits. If only some
        // recipients failed (bad numbers, etc.), let the caller record a
        // partial success instead of discarding the ones that went through.
        if (successCount === 0 && failedCount > 0) {
            const firstFailure = results.find((r) => !r.success);
            console.error("iSMS API: all messages failed.", results);
            throw new AppError(
                status.BAD_GATEWAY,
                `iSMS API failed: ${firstFailure?.errorDescription || firstFailure?.raw || "Unknown error"} (code ${firstFailure?.code})`,
            );
        }

        return { results, successCount, failedCount, raw };
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
