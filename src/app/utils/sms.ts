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

// Per https://www.isms.com.my/response_result.php
const ISMS_ERROR_CODES: Record<number, string> = {
    [-1000]: "UNKNOWN ERROR",
    [-1001]: "AUTHENTICATION FAILED",
    [-1002]: "ACCOUNT SUSPENDED / EXPIRED",
    [-1003]: "IP NOT ALLOWED",
    [-1004]: "INSUFFICIENT CREDITS",
    [-1005]: "INVALID SMS TYPE",
    [-1006]: "INVALID BODY LENGTH (1-900)",
    [-1007]: "INVALID HEX BODY",
    [-1008]: "MISSING PARAMETER",
    [-1009]: "INVALID DESTINATION NUMBER",
    [-1012]: "INVALID MESSAGE TYPE (use type=2 for Unicode)",
    [-1013]: "INVALID TERM AND AGREEMENT (agreedterm=YES required)",
};

/**
 * Parse a single iSMS result entry. iSMS does NOT return `{ code, status }`
 * objects — per their docs, a success looks like the string "2000 = SUCCESS"
 * (or is blank/empty), and a failure is a bare negative numeric code (e.g. -1004),
 * sometimes as a number, sometimes as a string, sometimes with a trailing
 * ":<trx_id>" on success (e.g. "2000 = SUCCESS:1143007207").
 */
const parseIsmsResultEntry = (entry: unknown, to: string): SMSSendResult => {
    // Treat null/undefined/empty string as success (iSMS docs: "or EMPTY/BLANK")
    if (entry === null || entry === undefined || entry === "") {
        return { to, raw: String(entry), code: 2000, success: true };
    }

    const raw = typeof entry === "string" ? entry : JSON.stringify(entry);

    // Objects that happen to carry a numeric code/status (some accounts/proxies do this)
    if (typeof entry === "object" && entry !== null) {
        const obj = entry as Record<string, any>;
        const code = Number(obj.code ?? obj.status_code ?? NaN);
        if (!Number.isNaN(code)) {
            const success = code === 2000;
            return {
                to,
                raw,
                code,
                success,
                errorDescription: success ? undefined : ISMS_ERROR_CODES[code],
            };
        }
    }

    // Pull the leading (possibly negative) integer out of strings like
    // "2000 = SUCCESS:1143007207" or "-1004" or "-1004 = INSUFFICIENT CREDITS"
    const match = raw.match(/-?\d+/);
    const code = match ? parseInt(match[0], 10) : null;
    const success = code === 2000;

    return {
        to,
        raw,
        code,
        success,
        errorDescription: success
            ? undefined
            : ((code !== null ? ISMS_ERROR_CODES[code] : undefined) ??
              (raw.trim() ? raw : "Unknown error")),
    };
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

            const requestBody = {
                un: username,
                pwd: secretKey,
                type,
                agreedterm: "YES",
                ...(env.isms.sendId ? { sendid: env.isms.sendId } : {}),
                messages: chunk.map((r) => ({
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
            // can come back as a bare string like "-1001"), so parse defensively.
            const rawText = await response.text();
            let data: any;
            try {
                data = JSON.parse(rawText);
            } catch {
                data = rawText;
            }

            // The bulk JSON endpoint returns an array of per-recipient result
            // strings/entries, in the same order as `messages` was sent — e.g.
            // ["2000 = SUCCESS:1143007207", "-1009", ...]. A single top-level
            // error (auth failure, missing param, etc.) can also come back as
            // one scalar value applying to the whole chunk.
            const entries: unknown[] = Array.isArray(data)
                ? data
                : new Array(chunk.length).fill(data);

            const parsed: SMSSendResult[] = chunk.map((r, i) =>
                parseIsmsResultEntry(entries[i], r.to),
            );

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
