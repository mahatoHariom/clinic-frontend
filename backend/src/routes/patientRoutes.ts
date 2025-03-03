import express, { Request, Response } from "express";
import { prisma } from "../index";

const router = express.Router();

interface PatientInput {
  name: string;
  procedure: string;
}

interface ResponseInput {
  followUpId: string;
  status: "HEALTHY" | "CONCERN";
  response?: string;
}

router.post(
  "/patients",
  async (req: Request<{}, {}, PatientInput>, res: Response): Promise<any> => {
    try {
      const { name, procedure } = req.body;
      if (!name || !procedure) {
        return res
          .status(400)
          .json({ error: "Name and procedure are required" });
      }

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
      console.error("Error creating patient:", error);
      return res.status(500).json({ error: "Failed to create patient" });
    }
  }
);

router.get("/follow-ups", async (req: Request, res: Response): Promise<any> => {
  try {
    const followUps = await prisma.followUp.findMany({
      include: { patient: true },
      orderBy: { scheduledAt: "asc" },
    });
    return res.json(followUps);
  } catch (error) {
    console.error("Error fetching follow-ups:", error);
    return res.status(500).json({ error: "Failed to fetch follow-ups" });
  }
});

router.post(
  "/respond",
  async (req: Request<{}, {}, ResponseInput>, res: Response): Promise<any> => {
    try {
      const { followUpId, status, response } = req.body;
      if (!followUpId || !status) {
        return res
          .status(400)
          .json({ error: "Follow-up ID and status are required" });
      }

      const followUp = await prisma.followUp.update({
        where: { id: followUpId },
        data: {
          status: status as "PENDING" | "HEALTHY" | "CONCERN",
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
      console.error("Error submitting response:", error);
      return res.status(500).json({ error: "Failed to submit response" });
    }
  }
);

router.get(
  "/notifications",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const notifications = await prisma.notification.findMany({
        orderBy: { createdAt: "desc" },
      });
      return res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return res.status(500).json({ error: "Failed to fetch notifications" });
    }
  }
);

export default router;
