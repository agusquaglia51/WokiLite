import pino from "pino";

export const logger = pino({
  transport: {
    target: "pino-pretty", // Hace la salida legible en consola
    options: {
      colorize: true,
      translateTime: "HH:MM:ss.l",
      ignore: "pid,hostname",
    },
  },
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
});
