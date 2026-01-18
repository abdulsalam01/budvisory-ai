export type RecommendationRequest = {
  origin: string;
  destination: string;
  duration: number;
  budget: number;
  salary?: number;
  age?: number;
  dreamTrip?: boolean;
  notes?: string;
};

export type RecommendationDay = {
  day: number;
  title: string;
  description: string;
  budgetTips?: string;
};

export type RecommendationResponse = {
  destination: string;
  summary: string;
  estimatedDailyBudget: string;
  totalEstimatedCost: string;
  estimatedSavings: string;
  budgetAdvisory: string;
  itinerary: RecommendationDay[];
  packingList: string[];
  safetyNotes: string[];
};

export type RecommendationSlide =
  | {
      type: "summary";
    }
  | {
      type: "day";
      day: RecommendationDay;
    };
