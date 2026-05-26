export type ClickType = "whatsapp" | "messenger";

export interface UpdateClickInput {
    type: ClickType;
}

export interface UpdateAdminInput {
    businessName?: string;
    businessDescription?: string;
    businessAddress?: string;
    shippingInfo?: string;

    social?: {
        facebookPage1?: string;
        facebookPage2?: string;
        messengerId?: string;
        whatsappNumber?: string;
        emailAddress?: string;
        websiteLink?: string;
    };
}