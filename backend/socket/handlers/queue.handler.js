import QueueService from "../services/queue.service";
import logger from "../../utils/asyncHandler";

export const handleGetSessionData = async (
  socket,
  sessionNamespace,
  userId,
  sessionCode,
  callback
) => {
  try {
    const { sessionCode } = data;
    const sessionData = await QueueService.getSessionDataByCode(sessionCode);
    if (!sessionData.success) {
      if (callback && typeof callback === "function") {
        callback({
          success: false,
          message: sessionData.message,
        });
      }
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
