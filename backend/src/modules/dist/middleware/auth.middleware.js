// shim: re-export the real middleware to satisfy imports referencing modules/dist/
// apontar para o arquivo TypeScript original
export * from "../../../middleware/auth.middleware.ts";
export { default } from "../../../middleware/auth.middleware.ts";
