export interface DailyStatSummary {
    date: string;
    count: number;
}

export interface StatWithGrowth {
    total: number;
    todayCount: number;
    growthPercent: number;
}

export interface DashboardStats {
    products: StatWithGrowth;
    categories: StatWithGrowth;
    whatsappClicks: StatWithGrowth;
    messengerClicks: StatWithGrowth;
    productClicksLast30Days: DailyStatSummary[];
    topViewedProducts: {
        id: string;
        name: string;
        totalClicks: number;
        images: string[];
    }[];
}