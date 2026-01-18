"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import destinationOptions from "@/data/destinations.json";
import { HomeHeader } from "@/app/components/HomeHeader";
import { RecommendationsPanel } from "@/app/components/RecommendationsPanel";
import { TripForm } from "@/app/components/TripForm";
import {
  buildBudgetValue,
  buildSalaryValue,
  formatCurrency,
} from "@/lib/formatters";
import { getLocationLabel } from "@/lib/location";
import type {
  RecommendationResponse,
  RecommendationSlide,
} from "@/lib/recommendations/types";

const USERNAME_STORAGE_KEY = "budvisory.username";

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("");
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

  const slides = useMemo<RecommendationSlide[]>(() => {
    if (!recommendation) return [];

    return [
      { type: "summary" },
      ...recommendation.itinerary.map((day) => ({ type: "day" as const, day })),
    ];
  }, [recommendation]);

  useEffect(() => {
    if (recommendation) {
      setActiveSlide(0);
    }
  }, [recommendation]);

  useEffect(() => {
    const storedUsername =
      typeof window === "undefined"
        ? ""
        : window.localStorage.getItem(USERNAME_STORAGE_KEY) || "";

    if (!storedUsername) {
      router.replace("/login");
      return;
    }

    setUsername(storedUsername);
  }, [router]);

  const budgetHint = budget
    ? `Trip budget: ${formatCurrency(budget)}`
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
        <HomeHeader username={username} />

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <TripForm
            locationLabel={locationLabel}
            originInput={originInput}
            onOriginChange={setOriginInput}
            destination={destination}
            destinationOptions={destinationOptions}
            onDestinationChange={setDestination}
            duration={duration}
            onDurationChange={setDuration}
            budgetInput={budgetInput}
            budgetHint={budgetHint}
            onBudgetChange={handleBudgetChange}
            showAdvanced={showAdvanced}
            onShowAdvancedChange={setShowAdvanced}
            salaryInput={salaryInput}
            onSalaryChange={handleSalaryChange}
            age={age}
            onAgeChange={setAge}
            dreamTrip={dreamTrip}
            onDreamTripChange={setDreamTrip}
            notes={notes}
            onNotesChange={setNotes}
            error={error}
            loadingLocation={loadingLocation}
            onUseLocation={handleUseLocation}
            loadingRecommendation={loadingRecommendation}
            budget={budget}
            onSubmit={handleSubmit}
          />

          <RecommendationsPanel
            recommendation={recommendation}
            slides={slides}
            activeSlide={activeSlide}
            onPrevious={() => setActiveSlide((prev) => Math.max(prev - 1, 0))}
            onNext={() =>
              setActiveSlide((prev) => Math.min(prev + 1, slides.length - 1))
            }
          />
        </div>
      </div>
    </div>
  );
}
