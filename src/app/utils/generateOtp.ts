export const generateOtp = (): { otp: string; expiresAt: Date } => {
    const otp = Array.from({ length: 6 }, () =>
        Math.floor(Math.random() * 10),
    ).join("");

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    return {
        otp,
        expiresAt,
    };
};
