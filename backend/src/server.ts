import express, { Application } from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import compression from "compression";
import connectDB from "./config/db";
import indexRoutes from "./routes/index";
import procurementRoutes from "./routes/procurements";

dotenv.config();
connectDB();

const app: Application = express();

// Middleware
app.use(express.json());
app.use(helmet());
app.use(compression());

// Routes
app.use("/", indexRoutes);
app.use("/api/procurements", procurementRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
