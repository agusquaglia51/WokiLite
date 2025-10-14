import express from 'express';
import pinoHttp from 'pino-http';
import dotenv from 'dotenv';
import { ensureDatabaseExists } from './db/index.ts';

dotenv.config();

const server = express();
const port = process.env.PORT || 3001;

server.use(pinoHttp());

await ensureDatabaseExists();

server.get('/', (_req, res) => {
  res.send('Hello World!');
});

server.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});



