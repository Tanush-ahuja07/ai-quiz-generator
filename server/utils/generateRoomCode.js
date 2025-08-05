import { customAlphabet } from "nanoid"
import Quiz from "../models/Quiz.js"

// 6-character uppercase alphanumeric
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

const generateUniqueRoomCode = async () => {
  let code;
  let exists = true;

  while (exists) {
    code = nanoid(); // e.g., "G4T2K9"
    const existing = await Quiz.findOne({ roomCode: code });
    exists = !!existing;
  }

  return code;
};

export default generateUniqueRoomCode;
