/* eslint-disable object-curly-spacing, indent, max-len, operator-linebreak, arrow-parens */
import {onDocumentCreated, onDocumentDeleted, onDocumentWritten} from "firebase-functions/v2/firestore";
import admin from "firebase-admin";

admin.initializeApp();

const calculateExpPoints = (task) => {
  if (!task) return 0;
  return {
    low: 5,
    medium: 10,
    high: 20,
  }[task.importance] || 10;
};

const calculateNewLevel = (currentLevel, currentProgress, expPoints, isGaining) => {
  const currentTotalProgress = (currentLevel - 1) * 100 + currentProgress;
  const updatedTotalProgress = Math.max(0, currentTotalProgress + (isGaining ? expPoints : -expPoints));

  const MAX_LEVEL = 999;
  const newLevel = Math.min(Math.floor(updatedTotalProgress / 100) + 1, MAX_LEVEL);
  const remainingProgress = updatedTotalProgress % 100;

  return { level: newLevel, progress: remainingProgress };
};

export const handleTaskUpdate = onDocumentWritten(
  "users/{userId}",
  async (event) => {
    const after = event.data.after.data();
    const before = event.data.before.data();

    if (!before || !after) return;

    const completedDiff = after.completedTasks.length - before.completedTasks.length;
    if (completedDiff === 0) return;

    const newTask = completedDiff > 0
      ? after.completedTasks[0]
      : before.completedTasks.find(t => !after.completedTasks.some(nt => nt.id === t.id));

    const expPoints = calculateExpPoints(newTask);
    const { level, progress } = calculateNewLevel(before.level, before.progress, expPoints, completedDiff > 0);

    await event.data.after.ref.update({ level, progress });
  },
);

// Handle task completion and level progression
export const handleTaskCompletion = onDocumentCreated(
  "users/{userId}/completedTasks/{taskId}",
  async (event) => {
    try {
      const snapshot = event.data;
      const userId = event.params.userId;
      const task = snapshot.data();

      // Calculate progress and level
      const userRef = admin.firestore().collection("users").doc(userId);
      const userDoc = await userRef.get();
      const userData = userDoc.data();

      const currentTotalProgress = (userData.level - 1) * 100 + userData.progress;
      const expPoints = {
        low: 5,
        medium: 10,
        high: 20,
      }[task.importance] || 10;

      const updatedTotalProgress = currentTotalProgress + expPoints;
      const MAX_LEVEL = 999;
      const newLevel = Math.min(
        Math.floor(updatedTotalProgress / 100) + 1,
        MAX_LEVEL,
      );
      const remainingProgress = updatedTotalProgress % 100;

      // Update user data
      await userRef.update({
        level: newLevel,
        progress: remainingProgress,
      });
    } catch (error) {
      console.log("Error processing task completion", {
        error: error.message,
        userId: event.params.userId,
      });
      throw error;
    }
  },
);

// Handle task deletion and level reduction
export const handleTaskDeletion = onDocumentDeleted(
  "users/{userId}/completedTasks/{taskId}",
  async (event) => {
    try {
      const userId = event.params.userId;
      const oldData = event.data.previous.data();

      console.log("Processing task deletion", {
        userId,
        taskId: event.params.taskId,
      });

      // Calculate progress and level reduction
      const userRef = admin.firestore().collection("users").doc(userId);
      const userDoc = await userRef.get();
      const userData = userDoc.data();

      const currentTotalProgress = (userData.level - 1) * 100 + userData.progress;
      const expPoints = {
        low: 5,
        medium: 10,
        high: 20,
      }[oldData.importance] || 10;

      const updatedTotalProgress = Math.max(0, currentTotalProgress - expPoints);
      const newLevel = Math.floor(updatedTotalProgress / 100) + 1;
      const remainingProgress = updatedTotalProgress % 100;

      // Update user data
      await userRef.update({
        level: newLevel,
        progress: remainingProgress,
      });

      console.log("Successfully updated user level after deletion", {
        userId,
        newLevel,
        remainingProgress,
      });
    } catch (error) {
      console.log("Error processing task deletion", {
        error: error.message,
        userId: event.params.userId,
      });
      throw error;
    }
  },
);
