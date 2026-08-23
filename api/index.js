import app from "../server.js";

export default async function handler(req, res) {
  try {
    return await app(req, res);
  } catch (error) {
    console.error("Vercel API handler failed:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
