import { Activity, ActivityMethod } from "../models/activity.model";

export const logActivity = async (
    method: ActivityMethod,
    description: string,
): Promise<void> => {
    await Activity.create({ method, description });
};
