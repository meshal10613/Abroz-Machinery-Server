export interface DailyStatSummary {
    date: string;
    count: number;
}

export interface StatWithGrowth {
    total: number;
    todayCount: number;
    growthPercent: number;
}

export interface ActivitySummary {
    id: string;
    method: string;
    description: string;
    createdAt: Date;
}

export interface DashboardStats {
    products: StatWithGrowth;
    categories: StatWithGrowth;
    whatsappClicks: StatWithGrowth;
    messengerClicks: StatWithGrowth;
    productClicksLast30Days: DailyStatSummary[];
    activitiesLast7Days: ActivitySummary[];
    topViewedProducts: {
        id: string;
        name: string;
        category: string;
        totalClicks: number;
        growthPercent: number;
        images: string[];
    }[];
}
