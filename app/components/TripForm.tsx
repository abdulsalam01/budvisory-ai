import { type FormEvent } from "react";

const inputClassName =
  "h-11 rounded-2xl border border-zinc-200 px-4 text-base text-zinc-900 shadow-sm focus:border-zinc-400 focus:outline-none";

const selectClassName =
  "h-11 rounded-2xl border border-zinc-200 bg-white px-4 text-base text-zinc-900 shadow-sm focus:border-zinc-400 focus:outline-none";

type TripFormProps = {
  locationLabel: string;
  originInput: string;
  onOriginChange: (value: string) => void;
  destination: string;
  destinationOptions: string[];
  onDestinationChange: (value: string) => void;
  duration: string;
  onDurationChange: (value: string) => void;
  budgetInput: string;
  budgetHint: string;
  onBudgetChange: (value: string) => void;
  showAdvanced: boolean;
  onShowAdvancedChange: (value: boolean) => void;
  salaryInput: string;
  onSalaryChange: (value: string) => void;
  age: string;
  onAgeChange: (value: string) => void;
  dreamTrip: boolean;
  onDreamTripChange: (value: boolean) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  error: string | null;
  loadingLocation: boolean;
  onUseLocation: () => void;
  loadingRecommendation: boolean;
  budget: number;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export const TripForm = ({
  locationLabel,
  originInput,
  onOriginChange,
  destination,
  destinationOptions,
  onDestinationChange,
  duration,
  onDurationChange,
  budgetInput,
  budgetHint,
  onBudgetChange,
  showAdvanced,
  onShowAdvancedChange,
  salaryInput,
  onSalaryChange,
  age,
  onAgeChange,
  dreamTrip,
  onDreamTripChange,
  notes,
  onNotesChange,
  error,
  loadingLocation,
  onUseLocation,
  loadingRecommendation,
  budget,
  onSubmit,
}: TripFormProps) => (
  <form
    onSubmit={onSubmit}
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
          onClick={onUseLocation}
          className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-100"
        >
          {loadingLocation ? "Locating..." : "Use my location"}
        </button>
      </div>
      <p className="text-xs text-zinc-500">
        Geolocation requires HTTPS or localhost and may take up to 8 seconds. If
        it fails, enter your origin manually below.
      </p>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
        Origin city
        <input
          type="text"
          value={originInput}
          onChange={(event) => onOriginChange(event.target.value)}
          placeholder="Jakarta"
          className={inputClassName}
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
        Destination city
        <select
          value={destination}
          onChange={(event) => onDestinationChange(event.target.value)}
          className={selectClassName}
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
          onChange={(event) => onDurationChange(event.target.value)}
          className={inputClassName}
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
        onChange={(event) => onBudgetChange(event.target.value)}
        className={inputClassName}
      />
      <span className="text-xs text-zinc-500">{budgetHint}</span>
    </label>

    <label className="flex items-center gap-3 rounded-2xl border border-dashed border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-700">
      <input
        type="checkbox"
        checked={showAdvanced}
        onChange={(event) => onShowAdvancedChange(event.target.checked)}
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
            onChange={(event) => onSalaryChange(event.target.value)}
            className={inputClassName}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
          Age
          <input
            type="number"
            min={17}
            max={80}
            value={age}
            onChange={(event) => onAgeChange(event.target.value)}
            className={inputClassName}
          />
        </label>
      </div>
    )}

    <label className="flex items-center gap-3 rounded-2xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-700">
      <input
        type="checkbox"
        checked={dreamTrip}
        onChange={(event) => onDreamTripChange(event.target.checked)}
        className="h-4 w-4 rounded border-zinc-300"
      />
      This is a dream destination, prioritize top experiences
    </label>

    <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
      Additional preferences
      <textarea
        value={notes}
        onChange={(event) => onNotesChange(event.target.value)}
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
);
