"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";

import destinationOptions from "./data/destinations.json";

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("id-ID");

const buildBudgetValue = (rawValue: string) => {
  const digitsOnly = rawValue.replace(/\D/g, "");
  if (!digitsOnly) {
    return { formatted: "", numeric: 0 };
  }
  const numeric = Number.parseInt(digitsOnly, 10);
  return {
    formatted: currencyFormatter.format(numeric),
    numeric,
  };
};

const formatIdrValue = (value: string) => {
  const digitsOnly = value.replace(/\D/g, "");
  if (!digitsOnly) {
    return value;
  }
  const numeric = Number.parseInt(digitsOnly, 10);
  return currencyFormatter.format(numeric);
};

const buildSalaryValue = (rawValue: string) => {
  const digitsOnly = rawValue.replace(/\D/g, "");
  if (!digitsOnly) {
    return { formatted: "", numeric: 0 };
  }
  const numeric = Number.parseInt(digitsOnly, 10);
  return {
    formatted: numberFormatter.format(numeric),
    numeric,
  };
};

const getLocationLabel = (city?: string, region?: string) => {
  if (city && region) {
    return `${city}, ${region}`;
  }
  if (city) {
    return city;
  }
  if (region) {
    return region;
  }
  return "Current location";
};

type RecommendationDay = {
  day: number;
  title: string;
  description: string;
  budgetTips?: string;
};

type RecommendationResponse = {
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

type CarouselSlide =
  | {
      type: "summary";
    }
  | {
      type: "day";
      day: RecommendationDay;
    };

export default function Home() {
  const [currentCity, setCurrentCity] = useState("");
  const [currentRegion, setCurrentRegion] = useState("");
  const [originInput, setOriginInput] = useState("Current location");
  const [destination, setDestination] = useState(destinationOptions[0]);
  const [duration, setDuration] = useState("3");
  const [budgetInput, setBudgetInput] = useState("");
  const [budget, setBudget] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [salaryInput, setSalaryInput] = useState("");
  const [salary, setSalary] = useState(0);
  const [age, setAge] = useState("");
  const [dreamTrip, setDreamTrip] = useState(false);
  const [notes, setNotes] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendation, setRecommendation] =
    useState<RecommendationResponse | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const locationLabel = useMemo(
    () => getLocationLabel(currentCity, currentRegion),
    [currentCity, currentRegion]
  );

  const slides = useMemo<CarouselSlide[]>(() => {
    if (!recommendation) {
      return [];
    }
    return [
      { type: "summary" },
      ...recommendation.itinerary.map((day) => ({ type: "day", day })),
    ];
  }, [recommendation]);

  useEffect(() => {
    if (recommendation) {
      setActiveSlide(0);
    }
  }, [recommendation]);

  const budgetHint = budget
    ? `Trip budget: ${currencyFormatter.format(budget)}`
    : "Enter your total trip budget";

  const handleBudgetChange = (value: string) => {
    const nextValue = buildBudgetValue(value);
    setBudgetInput(nextValue.formatted);
    setBudget(nextValue.numeric);
  };

  const handleSalaryChange = (value: string) => {
    const nextValue = buildSalaryValue(value);
    setSalaryInput(nextValue.formatted);
    setSalary(nextValue.numeric);
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setError("This device does not support geolocation.");
      return;
    }
    if (!window.isSecureContext) {
      setError(
        "Geolocation requires a secure context (HTTPS or localhost). Please enter your origin manually."
      );
      return;
    }

    setError(null);
    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`,
            {
              headers: {
                "Accept-Language": "id-ID",
              },
            }
          );
          if (!response.ok) {
            throw new Error("Failed to fetch location.");
          }
          const data = await response.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county;
          const region = data.address?.state || data.address?.region;
          const nextCity = city || "";
          const nextRegion = region || "";
          setCurrentCity(nextCity);
          setCurrentRegion(nextRegion);
          setOriginInput(getLocationLabel(nextCity, nextRegion));
        } catch (locationError) {
          console.error(locationError);
          setError("Unable to fetch location, please try again.");
        } finally {
          setLoadingLocation(false);
        }
      },
      (locationError) => {
        if (locationError.code === locationError.TIMEOUT) {
          setError(
            "Location request timed out. Please enter your origin manually."
          );
        } else {
          setError("Location permission was denied.");
        }
        setLoadingLocation(false);
      },
      { timeout: 8000, maximumAge: 0, enableHighAccuracy: false }
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoadingRecommendation(true);
    setError(null);
    setRecommendation(null);

    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          origin: originInput || locationLabel,
          destination,
          duration: Number(duration),
          budget,
          salary: showAdvanced ? salary : undefined,
          age: showAdvanced ? Number(age) : undefined,
          dreamTrip,
          notes,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Failed to fetch recommendations.");
      }

      const payload = (await response.json()) as RecommendationResponse;
      setRecommendation(payload);
    } catch (requestError) {
      console.error(requestError);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong."
      );
    } finally {
      setLoadingRecommendation(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900 sm:px-8 lg:px-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Budvisory AI
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-zinc-900 sm:text-5xl">
            Plan domestic travel in Indonesia with a realistic budget.
          </h1>
          <p className="max-w-3xl text-base leading-7 text-zinc-600">
            Choose a destination city, trip length, and your budget. We'll
            prepare a day-by-day itinerary that fits your finances, including a
            dream destination option if you're planning a wishlist trip.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5"
          >
            <div className="flex flex-col gap-3 rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-zinc-500">Detected location</p>
                  <p className="text-lg font-semibold text-zinc-900">
                    {locationLabel}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleUseLocation}
                  className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-100"
                >
                  {loadingLocation ? "Locating..." : "Use my location"}
                </button>
              </div>
              <p className="text-xs text-zinc-500">
                Geolocation requires HTTPS or localhost and may take up to 8
                seconds. If it fails, enter your origin manually below.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
                Origin city
                <input
                  type="text"
                  value={originInput}
                  onChange={(event) => setOriginInput(event.target.value)}
                  placeholder="Jakarta"
                  className="h-11 rounded-2xl border border-zinc-200 px-4 text-base text-zinc-900 shadow-sm focus:border-zinc-400 focus:outline-none"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
                Destination city
                <select
                  value={destination}
                  onChange={(event) => setDestination(event.target.value)}
                  className="h-11 rounded-2xl border border-zinc-200 bg-white px-4 text-base text-zinc-900 shadow-sm focus:border-zinc-400 focus:outline-none"
                >
                  {destinationOptions.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
                Duration (days)
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={duration}
                  onChange={(event) => setDuration(event.target.value)}
                  className="h-11 rounded-2xl border border-zinc-200 px-4 text-base text-zinc-900 shadow-sm focus:border-zinc-400 focus:outline-none"
                />
              </label>
            </div>

            <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
              Total trip budget (IDR)
              <input
                type="text"
                inputMode="numeric"
                placeholder="Rp 5.000.000"
                value={budgetInput}
                onChange={(event) => handleBudgetChange(event.target.value)}
                className="h-11 rounded-2xl border border-zinc-200 px-4 text-base text-zinc-900 shadow-sm focus:border-zinc-400 focus:outline-none"
              />
              <span className="text-xs text-zinc-500">{budgetHint}</span>
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-dashed border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-700">
              <input
                type="checkbox"
                checked={showAdvanced}
                onChange={(event) => setShowAdvanced(event.target.checked)}
                className="h-4 w-4 rounded border-zinc-300"
              />
              Show advanced options (salary & age)
            </label>

            {showAdvanced && (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
                  Monthly salary (IDR)
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Rp 8.500.000"
                    value={salaryInput}
                    onChange={(event) => handleSalaryChange(event.target.value)}
                    className="h-11 rounded-2xl border border-zinc-200 px-4 text-base text-zinc-900 shadow-sm focus:border-zinc-400 focus:outline-none"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
                  Age
                  <input
                    type="number"
                    min={17}
                    max={80}
                    value={age}
                    onChange={(event) => setAge(event.target.value)}
                    className="h-11 rounded-2xl border border-zinc-200 px-4 text-base text-zinc-900 shadow-sm focus:border-zinc-400 focus:outline-none"
                  />
                </label>
              </div>
            )}

            <label className="flex items-center gap-3 rounded-2xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-700">
              <input
                type="checkbox"
                checked={dreamTrip}
                onChange={(event) => setDreamTrip(event.target.checked)}
                className="h-4 w-4 rounded border-zinc-300"
              />
              This is a dream destination, prioritize top experiences
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
              Additional preferences
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                placeholder="Example: love local food, prefer a relaxed itinerary"
                className="rounded-2xl border border-zinc-200 px-4 py-3 text-base text-zinc-900 shadow-sm focus:border-zinc-400 focus:outline-none"
              />
            </label>

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loadingRecommendation || !budget}
              className="flex h-12 items-center justify-center rounded-full bg-zinc-900 text-base font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
            >
              {loadingRecommendation
                ? "Building recommendations..."
                : "Get travel recommendations"}
            </button>
          </form>

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
                      Slide {Math.min(activeSlide + 1, slides.length)} of{" "}
                      {slides.length}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveSlide((prev) => Math.max(prev - 1, 0))
                      }
                      disabled={activeSlide === 0}
                      className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:border-zinc-100 disabled:text-zinc-300"
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveSlide((prev) =>
                          Math.min(prev + 1, slides.length - 1)
                        )
                      }
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
                          {formatIdrValue(
                            recommendation.estimatedDailyBudget
                          )}
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
                        <p className="text-xs uppercase text-zinc-500">
                          Packing list
                        </p>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-600">
                          {recommendation.packingList.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-zinc-500">
                          Safety notes
                        </p>
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
                  Fill out the form on the left to request recommendations from
                  the AI.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
