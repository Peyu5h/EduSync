import prisma from "../config/db.js";
export const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required",
            });
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                class: {
                    include: {
                        courses: true,
                    },
                },
                taughtClasses: {
                    include: {
                        courses: true,
                        students: true,
                    },
                },
                assignments: true,
                wrongAnswers: true,
            },
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        const { password, ...userWithoutPassword } = user;
        // Make courses easily accessible in the response
        const userData = {
            ...userWithoutPassword,
            courses: user.role === "STUDENT"
                ? user.class?.courses || []
                : user.role === "CLASS_TEACHER"
                    ? user.taughtClasses.flatMap((c) => c.courses)
                    : [],
        };
        return res.status(200).json({
            success: true,
            data: userData,
        });
    }
    catch (error) {
        console.error("Error retrieving user:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};
export const getUsers = async (req, res) => {
    try {
        const { role, classId } = req.query;
        const where = {};
        if (role) {
            where.role = role;
        }
        if (classId) {
            where.classId = classId;
        }
        const users = await prisma.user.findMany({
            where,
            include: {
                class: {
                    select: {
                        name: true,
                    },
                },
            },
        });
        const sanitizedUsers = users.map((user) => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
        return res.status(200).json({
            success: true,
            data: sanitizedUsers,
        });
    }
    catch (error) {
        console.error("Error retrieving users:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};
