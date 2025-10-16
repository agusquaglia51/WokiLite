import express from 'express';
import pinoHttp from 'pino-http';
import dotenv from 'dotenv';
import availabilityRouter from './routes/availability.route.ts';
import reservationRouter from "./routes/reservation.route.ts";
import restaurantRouter from "./routes/restaurant.route.ts";
import { ensureDatabaseExists } from './db/index.ts';

dotenv.config();

const server = express();
const port = process.env.PORT || 3001;


server.use(pinoHttp());
server.use(express.json());


await ensureDatabaseExists();


server.use("/restaurants", restaurantRouter)

server.use("/availability",availabilityRouter);

server.use("/reservation", reservationRouter);

server.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});



