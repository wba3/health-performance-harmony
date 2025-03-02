
import { 
  insertSleepData, 
  insertTrainingData, 
  insertAIInsight 
} from "@/services/database";

// Function to insert sample sleep data for development
export const insertSampleSleepData = async () => {
  try {
    // Last 7 days of sleep data
    const sampleSleepData = [
      {
        date: new Date().toISOString().split('T')[0], // Today
        sleep_score: 85,
        total_sleep: 452, // 7h 32m
        deep_sleep: 105, // 1h 45m
        rem_sleep: 130, // 2h 10m
        light_sleep: 217, // 3h 37m
        resting_hr: 58,
        hrv: 48,
        respiratory_rate: 14.2
      },
      {
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
        sleep_score: 82,
        total_sleep: 438, // 7h 18m
        deep_sleep: 98, // 1h 38m
        rem_sleep: 125, // 2h 5m
        light_sleep: 215, // 3h 35m
        resting_hr: 60,
        hrv: 44,
        respiratory_rate: 14.5
      },
      {
        date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], // 2 days ago
        sleep_score: 78,
        total_sleep: 420, // 7h 0m
        deep_sleep: 95, // 1h 35m
        rem_sleep: 118, // 1h 58m
        light_sleep: 207, // 3h 27m
        resting_hr: 62,
        hrv: 42,
        respiratory_rate: 14.8
      },
      {
        date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0], // 3 days ago
        sleep_score: 80,
        total_sleep: 432, // 7h 12m
        deep_sleep: 100, // 1h 40m
        rem_sleep: 122, // 2h 2m
        light_sleep: 210, // 3h 30m
        resting_hr: 59,
        hrv: 45,
        respiratory_rate: 14.3
      },
      {
        date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0], // 4 days ago
        sleep_score: 75,
        total_sleep: 390, // 6h 30m
        deep_sleep: 90, // 1h 30m
        rem_sleep: 115, // 1h 55m
        light_sleep: 185, // 3h 5m
        resting_hr: 63,
        hrv: 40,
        respiratory_rate: 15.0
      },
      {
        date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0], // 5 days ago
        sleep_score: 83,
        total_sleep: 445, // 7h 25m
        deep_sleep: 102, // 1h 42m
        rem_sleep: 128, // 2h 8m
        light_sleep: 215, // 3h 35m
        resting_hr: 57,
        hrv: 46,
        respiratory_rate: 14.1
      },
      {
        date: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0], // 6 days ago
        sleep_score: 81,
        total_sleep: 435, // 7h 15m
        deep_sleep: 97, // 1h 37m
        rem_sleep: 123, // 2h 3m
        light_sleep: 215, // 3h 35m
        resting_hr: 61,
        hrv: 43,
        respiratory_rate: 14.6
      }
    ];

    for (const data of sampleSleepData) {
      await insertSleepData(data);
    }

    console.log('Sample sleep data inserted successfully');
    return true;
  } catch (error) {
    console.error('Error inserting sample sleep data:', error);
    return false;
  }
};

// Function to insert sample training data for development
export const insertSampleTrainingData = async () => {
  try {
    // Last 7 days of training data
    const sampleTrainingData = [
      {
        date: new Date().toISOString().split('T')[0], // Today
        activity_type: "Cycling",
        duration: 75, // 1h 15m
        distance: 32.5,
        calories: 620,
        avg_power: 210,
        max_power: 532,
        avg_heart_rate: 142,
        max_heart_rate: 168
      },
      {
        date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], // 2 days ago
        activity_type: "Cycling",
        duration: 90, // 1h 30m
        distance: 40.2,
        calories: 750,
        avg_power: 205,
        max_power: 515,
        avg_heart_rate: 145,
        max_heart_rate: 172
      },
      {
        date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0], // 4 days ago
        activity_type: "Cycling",
        duration: 60, // 1h 0m
        distance: 25.8,
        calories: 490,
        avg_power: 195,
        max_power: 485,
        avg_heart_rate: 138,
        max_heart_rate: 165
      },
      {
        date: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0], // 6 days ago
        activity_type: "Cycling",
        duration: 85, // 1h 25m
        distance: 36.7,
        calories: 680,
        avg_power: 200,
        max_power: 505,
        avg_heart_rate: 143,
        max_heart_rate: 170
      }
    ];

    for (const data of sampleTrainingData) {
      await insertTrainingData(data);
    }

    console.log('Sample training data inserted successfully');
    return true;
  } catch (error) {
    console.error('Error inserting sample training data:', error);
    return false;
  }
};

// Function to insert sample AI insights for development
export const insertSampleAIInsights = async () => {
  try {
    const sampleInsights = [
      {
        date: new Date().toISOString().split('T')[0], // Today
        insight_type: "performance",
        content: "Your sleep score has been consistently high this week, which correlates with improved performance during your morning workouts.",
        is_read: false,
        rating: null
      },
      {
        date: new Date().toISOString().split('T')[0], // Today
        insight_type: "recommendation",
        content: "Consider increasing your deep sleep by going to bed 30 minutes earlier on days before intense training sessions.",
        is_read: false,
        rating: null
      },
      {
        date: new Date().toISOString().split('T')[0], // Today
        insight_type: "alert",
        content: "Your heart rate variability (HRV) dropped significantly after yesterday's high-intensity workout. Consider a recovery day.",
        is_read: false,
        rating: null
      },
      {
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
        insight_type: "nutrition",
        content: "Based on your training intensity, aim for 2g of protein per kg of body weight today to support muscle recovery.",
        is_read: true,
        rating: 5
      },
      {
        date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], // 2 days ago
        insight_type: "hydration",
        content: "Your workout intensity suggests you should increase fluid intake. Aim for 3-4 liters of water today.",
        is_read: true,
        rating: 4
      }
    ];

    for (const insight of sampleInsights) {
      await insertAIInsight(insight);
    }

    console.log('Sample AI insights inserted successfully');
    return true;
  } catch (error) {
    console.error('Error inserting sample AI insights:', error);
    return false;
  }
};

// Function to insert all sample data at once
export const insertAllSampleData = async () => {
  await insertSampleSleepData();
  await insertSampleTrainingData();
  await insertSampleAIInsights();
  console.log('All sample data inserted successfully');
};
