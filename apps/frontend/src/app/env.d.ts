declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "staging";
    NEXT_PUBLIC_URL: string;
    NEXT_PUBLIC_API_URL: string;
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: string;
    NEXT_PUBLIC_GOOGLE_CLIENT_SECRET: string;
    NEXT_PUBLIC_AUTH_SECRET: string;
    NEXT_PUBLIC_BASE_URL: string;
  }
}