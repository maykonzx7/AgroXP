// shim: re-export the real middleware to satisfy imports referencing /dist/
export * from "../../middleware/auth.middleware.js";
export { default } from "../../middleware/auth.middleware.js";
// shim: re-export the real middleware to satisfy imports referencing /dist/
// apontar para o arquivo TypeScript original
export * from "../../../middleware/auth.middleware.ts";
export { default } from "../../../middleware/auth.middleware.ts";
