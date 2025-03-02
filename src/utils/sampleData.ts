import { insertTrainingData, TrainingData } from "@/services/database/trainingService";

// Function to generate sample training data
export const generateSampleTrainingData = () => {
  // Generate realistic workout data
  const workoutData = {
    date: new Date().toISOString().split('T')[0],
    activity_type: 'cycling',
    duration: 3600,
    distance: 25.5,
    calories: 650,
    avg_power: 175,
    max_power: 325,
    avg_heart_rate: 145,
    max_heart_rate: 175,
    source: 'sample' // Add this line to fix the error
  };
  
  return insertTrainingData(workoutData);
};
