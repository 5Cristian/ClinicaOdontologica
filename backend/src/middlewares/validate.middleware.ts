import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";

import { sanitizeValue } from "@/utils/sanitize";

export function validate(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.body = sanitizeValue(req.body);
    req.query = sanitizeValue(req.query);
    req.params = sanitizeValue(req.params);

    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params
    });

    req.body = parsed.body;
    req.query = parsed.query;
    req.params = parsed.params;

    return next();
  };
}
