export interface UpdateAdminInput {
    businessName?: string;
    businessPhoneNumber?: string;

    facebookPage?: {
        mainPage?: string;
        sparePartsPage?: string;
    };

    businessDescription?: string;
    businessAddress?: string;
}
