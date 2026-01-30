import QueueService from "../services/queue.service.js";
import logger from "../../utils/logger.js";

export const handleGetSessionData = async (
  socket,
  sessionNamespace,
  userId,
  sessionCode,
  data,
  callback
) => {
  try {
    const { sessionCode } = data;
    const sessionData = await QueueService.handleGetSessionData(sessionCode);
    if (!sessionData.success) {
      if (callback && typeof callback === "function") {
        callback({
          success: false,
          message: sessionData.message,
        });
      }
      return
    }
    logger.info(`Successfully retrieved session data for ${sessionCode}`);
    if (callback && typeof callback === "function") {
      callback({
        success: true,
        data: sesFsionData.data,
      });
    }

  } catch (err) {
    if (callback && typeof callback === "function") {
      callback({
        success: false,
        message: "Failed to get session data",
        error: err.message,
      });
    }
  }
};
