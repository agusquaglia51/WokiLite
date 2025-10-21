import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import availabilityRouter from './routes/availability.route.js';
import reservationRouter from "./routes/reservations.route.js";
import restaurantRouter from "./routes/restaurant.route.js";
import { ensureDatabaseExists } from './db/index.js';
import pinoHttp from 'pino-http';
import type { HttpLogger } from 'pino-http';
import { logger } from './logger.js';

dotenv.config();

const server = express();
const port = process.env.PORT || 3001;

server.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization","idempotency-key",]
}));

const httpLogger: HttpLogger = (pinoHttp as any).default?.({ logger }) ?? (pinoHttp as any)({ logger });


server.use(httpLogger);
server.use(express.json());


await ensureDatabaseExists();


server.use("/restaurants", restaurantRouter)

server.use("/availability",availabilityRouter);

server.use("/reservations", reservationRouter);

server.listen(port, () => {
  logger.info(`🚀 Server running on http://localhost:${port}`);
});



