// custom.d.ts or anywhere in your TypeScript project
import * as multer from "multer";
import { Request } from "express";

// Extend the Request interface to include files property
declare global {
  namespace Express {
    interface Request {
      files: multer.File[]; // Or `any[]` if you want more flexibility
    }
  }
}
