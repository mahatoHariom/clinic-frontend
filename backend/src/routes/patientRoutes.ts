import express, { Request, Response } from "express";
import { prisma } from "../index";
import { z } from "zod";
import { handleError } from "../middleware/error";

const router = express.Router();

const PatientInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  procedure: z.string().min(1, "Procedure is required"),
});

const ResponseInputSchema = z.object({
  followUpId: z.string().uuid("Invalid follow-up ID"),
  status: z.enum(["HEALTHY", "CONCERN"]),
  response: z.string().optional(),
});

router.post(
  "/patients",
  async (req: Request<{}, {}, unknown>, res: Response): Promise<any> => {
    try {
      const parsed = PatientInputSchema.parse(req.body);
      const { name, procedure } = parsed;

      const patient = await prisma.patient.create({
        data: {
          name,
          procedure,
          followUps: {
            create: [
              { scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
              { scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
              { scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
            ],
          },
        },
        include: { followUps: true },
      });

      return res.status(201).json(patient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      return handleError(res, error, "Failed to create patient");
    }
  }
);

// GET /follow-ups
router.get("/follow-ups", async (req: Request, res: Response): Promise<any> => {
  try {
    const followUps = await prisma.followUp.findMany({
      include: { patient: true },
      orderBy: { scheduledAt: "asc" },
    });
    return res.json(followUps);
  } catch (error) {
    return handleError(res, error, "Failed to fetch follow-ups");
  }
});

// POST /respond
router.post(
  "/respond",
  async (req: Request<{}, {}, unknown>, res: Response): Promise<any> => {
    try {
      const parsed = ResponseInputSchema.parse(req.body);
      const { followUpId, status, response } = parsed;

      const followUp = await prisma.followUp.update({
        where: { id: followUpId },
        data: {
          status,
          response: response || undefined,
        },
        include: { patient: true },
      });

      if (status === "CONCERN") {
        await prisma.notification.create({
          data: {
            message: `Concern raised for ${followUp.patient.name} (Follow-up ID: ${followUpId})`,
            followUpId,
          },
        });
      }

      return res.json(followUp);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      return handleError(res, error, "Failed to submit response");
    }
  }
);

// GET /notifications
router.get(
  "/notifications",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const notifications = await prisma.notification.findMany({
        orderBy: { createdAt: "desc" },
      });
      return res.json(notifications);
    } catch (error) {
      return handleError(res, error, "Failed to fetch notifications");
    }
  }
);

export default router;
