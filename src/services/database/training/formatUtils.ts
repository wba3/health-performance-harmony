
import { WorkoutData } from './types';

// Helper function to format workout data
export const formatWorkoutData = (data: Record<string, any>): WorkoutData => {
  // Ensure required fields
  if (!data.date || !data.activity_type) {
    throw new Error("Workout data must include date and activity_type");
  }

  return {
    date: data.date,
    activity_type: data.activity_type,
    duration: data.duration || null,
    distance: data.distance || null,
    calories: data.calories || null,
    avg_heart_rate: data.avg_heart_rate || null,
    max_heart_rate: data.max_heart_rate || null,
    avg_power: data.avg_power || null,
    max_power: data.max_power || null,
    source: data.source || 'manual'
  };
};

// Helper function to define training data properties
export const defineTrainingData = (data: WorkoutData): Omit<any, 'id' | 'created_at' | 'updated_at'> => {
  return {
    date: data.date,
    activity_type: data.activity_type,
    duration: data.duration || null,
    distance: data.distance || null,
    calories: data.calories || null,
    avg_heart_rate: data.avg_heart_rate || null,
    max_heart_rate: data.max_heart_rate || null,
    avg_power: data.avg_power || null,
    max_power: data.max_power || null,
    source: data.source || 'manual'
  };
};
