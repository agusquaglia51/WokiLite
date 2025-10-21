import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import dotenv from 'dotenv';
import availabilityRouter from './routes/availability.route';
import reservationRouter from "./routes/reservations.route";
import restaurantRouter from "./routes/restaurant.route";
import { ensureDatabaseExists } from './db/index';
import { logger } from './logger';

dotenv.config();

const server = express();
const port = process.env.PORT || 3001;

server.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization","idempotency-key",]
}));


server.use(pinoHttp({ logger }));
server.use(express.json());


await ensureDatabaseExists();


server.use("/restaurants", restaurantRouter)

server.use("/availability",availabilityRouter);

server.use("/reservations", reservationRouter);

server.listen(port, () => {
  logger.info(`🚀 Server running on http://localhost:${port}`);
});



