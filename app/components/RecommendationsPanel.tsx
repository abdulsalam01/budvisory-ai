import { formatIdrValue } from "@/lib/formatters";
import type {
  RecommendationResponse,
  RecommendationSlide,
} from "@/lib/recommendations/types";

type RecommendationsPanelProps = {
  recommendation: RecommendationResponse | null;
  slides: RecommendationSlide[];
  activeSlide: number;
  onPrevious: () => void;
  onNext: () => void;
};

export const RecommendationsPanel = ({
  recommendation,
  slides,
  activeSlide,
  onPrevious,
  onNext,
}: RecommendationsPanelProps) => (
  <section className="flex flex-col gap-4 rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-zinc-900">
        AI Recommendations
      </h2>
      <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
        JSON Output
      </span>
    </div>
    {recommendation ? (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-100 bg-white px-4 py-3 text-sm text-zinc-600">
          <div>
            <p className="text-xs uppercase text-zinc-500">YOUR TRIP</p>
            <p className="text-sm font-semibold text-zinc-900">
              Slide {Math.min(activeSlide + 1, slides.length)} of {slides.length}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPrevious}
              disabled={activeSlide === 0}
              className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:border-zinc-100 disabled:text-zinc-300"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={activeSlide === slides.length - 1}
              className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:border-zinc-100 disabled:text-zinc-300"
            >
              Next
            </button>
          </div>
        </div>

        {slides[activeSlide]?.type === "summary" ? (
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
              <p className="text-xs uppercase text-zinc-500">Summary</p>
              <p className="text-base font-semibold text-zinc-900">
                {recommendation.summary}
              </p>
            </div>
            <div className="grid gap-3 rounded-2xl border border-zinc-100 bg-white p-4">
              <div>
                <p className="text-xs uppercase text-zinc-500">
                  Destination city
                </p>
                <p className="font-semibold text-zinc-900">
                  {recommendation.destination}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-zinc-500">
                  Estimated daily budget
                </p>
                <p className="font-semibold text-zinc-900">
                  {formatIdrValue(recommendation.estimatedDailyBudget)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-zinc-500">
                  Total estimated cost
                </p>
                <p className="font-semibold text-zinc-900">
                  {formatIdrValue(recommendation.totalEstimatedCost)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-zinc-500">
                  Estimated savings
                </p>
                <p className="font-semibold text-emerald-700">
                  {formatIdrValue(recommendation.estimatedSavings)}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
              <p className="text-xs uppercase text-emerald-700">
                Budget advisory
              </p>
              <p className="mt-2 text-sm text-emerald-900">
                {recommendation.budgetAdvisory}
              </p>
            </div>

            <div className="grid gap-3 rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
              <div>
                <p className="text-xs uppercase text-zinc-500">Packing list</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-600">
                  {recommendation.packingList.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs uppercase text-zinc-500">Safety notes</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-600">
                  {recommendation.safetyNotes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : slides[activeSlide]?.type === "day" ? (
          <div className="rounded-2xl border border-zinc-100 bg-white p-4">
            <p className="text-xs uppercase text-zinc-500">
              Day {slides[activeSlide].day.day}
            </p>
            <p className="text-base font-semibold text-zinc-900">
              {slides[activeSlide].day.title}
            </p>
            <p className="mt-2 text-sm text-zinc-600">
              {slides[activeSlide].day.description}
            </p>
            {slides[activeSlide].day.budgetTips && (
              <p className="mt-2 text-xs font-medium text-emerald-700">
                {slides[activeSlide].day.budgetTips}
              </p>
            )}
          </div>
        ) : null}
      </div>
    ) : (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-zinc-200 px-6 py-10 text-center text-sm text-zinc-500">
        <p className="text-base font-semibold text-zinc-700">
          No recommendations yet.
        </p>
        <p>
          Fill out the form on the left to request recommendations from the AI.
        </p>
      </div>
    )}
  </section>
);
