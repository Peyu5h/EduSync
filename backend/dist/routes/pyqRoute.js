import express from "express";
import fs from "fs";
import path from "path";
const router = express.Router();
/**
 * @route GET /api/pyq
 * @desc Get previous year questions
 * @access Public
 */
router.get("/", async (req, res) => {
    try {
        const pyqPath = path.join(process.cwd(), "pyq.txt");
        if (!fs.existsSync(pyqPath)) {
            return res
                .status(404)
                .json({ success: false, message: "PYQ file not found" });
        }
        const pyqData = fs.readFileSync(pyqPath, "utf-8");
        return res.status(200).send(pyqData);
    }
    catch (error) {
        console.error("Error serving PYQ data:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});
export default router;
