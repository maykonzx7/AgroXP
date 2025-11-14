// shim: re-export the real middleware to satisfy imports referencing modules/middleware/auth.middleware.js
export * from "../../middleware/auth.middleware.ts";
export { default } from "../../middleware/auth.middleware.ts";
