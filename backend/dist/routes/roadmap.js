import express from "express";
import prisma from "../config/db.js";
const router = express.Router();
// Generate a roadmap based on user's wrong answers
router.post("/generate", async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "User ID is required",
            });
        }
        // Get user's wrong answers
        const wrongAnswers = await prisma.wrongAnswer.findMany({
            where: { userId },
            orderBy: { timestamp: "desc" },
        });
        // Create topics based on wrong answers
        const topics = wrongAnswers.reduce((acc, answer) => {
            const topic = acc.find((t) => t.category === answer.materialName);
            if (topic) {
                return acc;
            }
            return [
                ...acc,
                {
                    title: `Master ${answer.materialName}`,
                    description: `Improve understanding of ${answer.materialName} concepts`,
                    order: acc.length,
                    targetDate: new Date(Date.now() + acc.length * 3 * 24 * 60 * 60 * 1000), // 3 days per topic
                    resources: [
                        {
                            title: "Video Tutorial",
                            type: "VIDEO",
                            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(answer.materialName)}`,
                            description: `Learn about ${answer.materialName} through video tutorials`,
                        },
                        {
                            title: "Practice Problems",
                            type: "PRACTICE",
                            url: `https://www.geeksforgeeks.org/problems/${encodeURIComponent(answer.materialName.toLowerCase())}`,
                            description: "Practice problems to reinforce learning",
                        },
                    ],
                },
            ];
        }, []);
        // Create the roadmap
        const roadmap = await prisma.$transaction(async (tx) => {
            const newRoadmap = await tx.roadmap.create({
                data: {
                    userId,
                    title: "Your Learning Roadmap",
                    description: "Based on your quiz performance",
                },
            });
            for (const topic of topics) {
                const newTopic = await tx.roadmapTopic.create({
                    data: {
                        roadmapId: newRoadmap.id,
                        title: topic.title,
                        description: topic.description,
                        order: topic.order,
                        targetDate: topic.targetDate,
                    },
                });
                for (const resource of topic.resources) {
                    await tx.roadmapResource.create({
                        data: {
                            topicId: newTopic.id,
                            ...resource,
                        },
                    });
                }
            }
            return tx.roadmap.findUnique({
                where: { id: newRoadmap.id },
                include: {
                    topics: {
                        include: {
                            resources: true,
                        },
                        orderBy: {
                            order: "asc",
                        },
                    },
                },
            });
        });
        res.json({ success: true, data: roadmap });
    }
    catch (error) {
        console.error("Error generating roadmap:", error);
        res.status(500).json({
            success: false,
            error: "Failed to generate roadmap",
        });
    }
});
// Get user's roadmaps
router.get("/", async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "User ID is required",
            });
        }
        const roadmaps = await prisma.roadmap.findMany({
            where: { userId: userId },
            include: {
                topics: {
                    include: {
                        resources: true,
                    },
                    orderBy: {
                        order: "asc",
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        res.json({ success: true, data: roadmaps });
    }
    catch (error) {
        console.error("Error fetching roadmaps:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch roadmaps",
        });
    }
});
// Get roadmap by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const roadmap = await prisma.roadmap.findUnique({
            where: { id },
            include: {
                topics: {
                    include: {
                        resources: true,
                    },
                    orderBy: {
                        order: "asc",
                    },
                },
            },
        });
        if (!roadmap) {
            return res.status(404).json({
                success: false,
                error: "Roadmap not found",
            });
        }
        res.json({ success: true, data: roadmap });
    }
    catch (error) {
        console.error("Error fetching roadmap:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch roadmap",
        });
    }
});
// Mark topic as completed
router.patch("/topic/:topicId/complete", async (req, res) => {
    try {
        const { topicId } = req.params;
        const topic = await prisma.roadmapTopic.update({
            where: { id: topicId },
            data: {
                isCompleted: true,
                updatedAt: new Date(),
            },
        });
        res.json({ success: true, data: topic });
    }
    catch (error) {
        console.error("Error completing topic:", error);
        res.status(500).json({
            success: false,
            error: "Failed to complete topic",
        });
    }
});
// Mark resource as completed
router.patch("/resource/:resourceId/complete", async (req, res) => {
    try {
        const { resourceId } = req.params;
        const resource = await prisma.roadmapResource.update({
            where: { id: resourceId },
            data: {
                isCompleted: true,
                updatedAt: new Date(),
            },
        });
        res.json({ success: true, data: resource });
    }
    catch (error) {
        console.error("Error completing resource:", error);
        res.status(500).json({
            success: false,
            error: "Failed to complete resource",
        });
    }
});
export default router;
