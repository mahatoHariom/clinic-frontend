import { Response } from "express";

export const handleError = (res: Response, error: unknown, message: string) => {
  console.error(message, error);
  return res.status(500).json({ error: message });
};
