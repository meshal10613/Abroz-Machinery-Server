import mongoose from "mongoose";
import dns from "node:dns";
import app from "./app";
import { seedAdmin } from "./app/seeds/admin.seed";
import { env } from "./app/config/env";

const start = async () => {
    try {
        if (env.mongoUri.startsWith("mongodb+srv://")) {
            dns.setServers(["8.8.8.8", "1.1.1.1"]);
        }

        await mongoose.connect(env.mongoUri);
        console.log("🗄️  MongoDB connected");

        // Run seed after DB connects
        await seedAdmin();

        app.listen(env.port, () => {
            console.log(`🚀 Server running on http://localhost:${env.port}`);
        });
    } catch (err) {
        console.error("Server failed to start:", err);
        process.exit(1);
    }
};

start();
