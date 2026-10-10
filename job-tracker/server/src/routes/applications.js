import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

const STAGES = [
  "WISHLIST", "APPLIED", "ASSESSMENT", "PHONE_SCREEN",
  "INTERVIEW", "OFFER", "ACCEPTED", "REJECTED", "WITHDRAWN",
];

const optionalText = z.string().trim().optional().nullable();

const createSchema = z.object({
  company: z.string().trim().min(1),
  role: z.string().trim().min(1),
  jobUrl: optionalText,
  location: optionalText,
  source: optionalText,
  notes: optionalText,
  stage: z.enum(STAGES).default("APPLIED"),
  appliedAt: z.coerce.date().optional().nullable(),
});

const updateSchema = createSchema.omit({ stage: true }).partial();
const stageSchema = z.object({ stage: z.enum(STAGES) });

// Find an application only if it belongs to the logged-in user
function findOwned(id, userId) {
  return prisma.application.findFirst({ where: { id, userId } });
}

router.get("/", async (req, res, next) => {
  try {
    const { stage, q } = req.query;
    const applications = await prisma.application.findMany({
      where: {
        userId: req.userId,
        ...(stage ? { stage } : {}),
        ...(q
          ? {
              OR: [
                { company: { contains: String(q), mode: "insensitive" } },
                { role: { contains: String(q), mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { updatedAt: "desc" },
    });
    res.json(applications);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body);

    const application = await prisma.$transaction(async (tx) => {
      const created = await tx.application.create({
        data: { ...data, userId: req.userId },
      });
      await tx.stageEvent.create({
        data: { applicationId: created.id, fromStage: null, toStage: created.stage },
      });
      return created;
    });

    res.status(201).json(application);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const application = await prisma.application.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: {
        events: { orderBy: { createdAt: "asc" } },
        reminders: { orderBy: { dueAt: "asc" } },
        contacts: true,
      },
    });
    if (!application) return res.status(404).json({ error: "Not found" });
    res.json(application);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const data = updateSchema.parse(req.body);
    if (!(await findOwned(req.params.id, req.userId))) {
      return res.status(404).json({ error: "Not found" });
    }
    const updated = await prisma.application.update({ where: { id: req.params.id }, data });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/stage", async (req, res, next) => {
  try {
    const { stage } = stageSchema.parse(req.body);
    const current = await findOwned(req.params.id, req.userId);
    if (!current) return res.status(404).json({ error: "Not found" });
    if (current.stage === stage) return res.json(current);

    const updated = await prisma.$transaction(async (tx) => {
      const app = await tx.application.update({
        where: { id: current.id },
        data: { stage },
      });
      await tx.stageEvent.create({
        data: { applicationId: current.id, fromStage: current.stage, toStage: stage },
      });
      return app;
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (!(await findOwned(req.params.id, req.userId))) {
      return res.status(404).json({ error: "Not found" });
    }
    await prisma.application.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
