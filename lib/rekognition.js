import { RekognitionClient } from "@aws-sdk/client-rekognition";

export const rekognitionClient = new RekognitionClient({});
export const SIMILARITY_THRESHOLD = 80;