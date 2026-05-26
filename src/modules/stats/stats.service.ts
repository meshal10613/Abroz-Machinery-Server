import { Admin } from "../../models/admin.model";
import { Category } from "../../models/category.model";
import { Product } from "../../models/product.model";
import { DashboardStats } from "./stats.interface";

const calcGrowth = (today: number, yesterday: number): number => {
    if (yesterday === 0) return today > 0 ? 100 : 0;
    return Math.round(((today - yesterday) / yesterday) * 100);
};

const getDashboardStats = async (): Promise<DashboardStats> => {
    const now = new Date();

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const thirtyDaysAgo = new Date(todayStart);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const todayStr = now.toISOString().split("T")[0];
    const yesterdayStr = yesterdayStart.toISOString().split("T")[0];

    // ── 1. Products ──────────────────────────────────────────────────────────
    const [totalProducts, todayProducts, yesterdayProducts] = await Promise.all(
        [
            Product.countDocuments(),
            Product.countDocuments({ createdAt: { $gte: todayStart } }),
            Product.countDocuments({
                createdAt: { $gte: yesterdayStart, $lt: todayStart },
            }),
        ],
    );

    // ── 2. Categories ────────────────────────────────────────────────────────
    const [totalCategories, todayCategories, yesterdayCategories] =
        await Promise.all([
            Category.countDocuments(),
            Category.countDocuments({ createdAt: { $gte: todayStart } }),
            Category.countDocuments({
                createdAt: { $gte: yesterdayStart, $lt: todayStart },
            }),
        ]);

    // ── 3. Admin click analytics ─────────────────────────────────────────────
    const admin = await Admin.findOne().lean();

    const whatsappTotal = admin?.analytics?.totalWhatsappClicks ?? 0;
    const messengerTotal = admin?.analytics?.totalMessengerClicks ?? 0;

    const todayWhatsapp =
        admin?.analytics?.whatsappClicksByDate?.find(
            (d) => String(d.date).split("T")[0] === todayStr,
        )?.count ?? 0;

    const yesterdayWhatsapp =
        admin?.analytics?.whatsappClicksByDate?.find(
            (d) => String(d.date).split("T")[0] === yesterdayStr,
        )?.count ?? 0;

    const todayMessenger =
        admin?.analytics?.messengerClicksByDate?.find(
            (d) => String(d.date).split("T")[0] === todayStr,
        )?.count ?? 0;

    const yesterdayMessenger =
        admin?.analytics?.messengerClicksByDate?.find(
            (d) => String(d.date).split("T")[0] === yesterdayStr,
        )?.count ?? 0;

    // ── 4. Last 30 days product clicks ───────────────────────────────────────
    const clickAggregation = await Product.aggregate([
        { $unwind: "$analytics.clicksByDate" },
        {
            $match: {
                "analytics.clicksByDate.date": {
                    $gte: thirtyDaysAgo.toISOString().split("T")[0],
                },
            },
        },
        {
            $group: {
                _id: "$analytics.clicksByDate.date",
                count: { $sum: "$analytics.clicksByDate.count" },
            },
        },
        { $sort: { _id: 1 } },
        {
            $project: {
                _id: 0,
                date: "$_id",
                count: 1,
            },
        },
    ]);

    // ── 5. Top 5 most viewed products ────────────────────────────────────────
    const topProducts = await Product.find()
        .sort({ "analytics.totalClicks": -1 })
        .limit(5)
        .select("name images analytics.totalClicks")
        .lean();

    return {
        products: {
            total: totalProducts,
            todayCount: todayProducts,
            growthPercent: calcGrowth(todayProducts, yesterdayProducts),
        },
        categories: {
            total: totalCategories,
            todayCount: todayCategories,
            growthPercent: calcGrowth(todayCategories, yesterdayCategories),
        },
        whatsappClicks: {
            total: whatsappTotal,
            todayCount: todayWhatsapp,
            growthPercent: calcGrowth(todayWhatsapp, yesterdayWhatsapp),
        },
        messengerClicks: {
            total: messengerTotal,
            todayCount: todayMessenger,
            growthPercent: calcGrowth(todayMessenger, yesterdayMessenger),
        },
        productClicksLast30Days: clickAggregation,
        topViewedProducts: topProducts.map((p) => ({
            id: String(p._id),
            name: p.name,
            totalClicks: p.analytics?.totalClicks ?? 0,
            images: p.images ?? [],
        })),
    };
};

export const StatsService = {
	getDashboardStats,
};