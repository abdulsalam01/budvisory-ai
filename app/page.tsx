"use client";

import { type FormEvent, useMemo, useState } from "react";

const destinationOptions = [
  "Jakarta",
  "Bandung",
  "Surabaya",
  "Yogyakarta",
  "Denpasar",
  "Medan",
  "Makassar",
  "Semarang",
  "Malang",
  "Lombok",
  "Labuan Bajo",
  "Padang",
  "Palembang",
  "Balikpapan",
  "Manado",
];

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
  return "Lokasi saat ini";
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
  itinerary: RecommendationDay[];
  packingList: string[];
  safetyNotes: string[];
};

export default function Home() {
  const [currentCity, setCurrentCity] = useState("");
  const [currentRegion, setCurrentRegion] = useState("");
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

  const locationLabel = useMemo(
    () => getLocationLabel(currentCity, currentRegion),
    [currentCity, currentRegion]
  );

  const budgetHint = budget
    ? `Budget perjalanan: ${currencyFormatter.format(budget)}`
    : "Masukkan budget total perjalanan";

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
      setError("Perangkat ini tidak mendukung geolocation.");
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
            throw new Error("Gagal mengambil lokasi.");
          }
          const data = await response.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county;
          const region = data.address?.state || data.address?.region;
          setCurrentCity(city || "");
          setCurrentRegion(region || "");
        } catch (locationError) {
          console.error(locationError);
          setError("Tidak bisa mengambil lokasi, coba lagi.");
        } finally {
          setLoadingLocation(false);
        }
      },
      () => {
        setError("Izin lokasi ditolak.");
        setLoadingLocation(false);
      },
      { timeout: 10000 }
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
          origin: locationLabel,
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
        throw new Error(payload.error || "Gagal mengambil rekomendasi.");
      }

      const payload = (await response.json()) as RecommendationResponse;
      setRecommendation(payload);
    } catch (requestError) {
      console.error(requestError);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Terjadi kesalahan."
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
            Rencanakan perjalanan domestik di Indonesia dengan budget yang
            realistis.
          </h1>
          <p className="max-w-3xl text-base leading-7 text-zinc-600">
            Tentukan kota tujuan, durasi perjalanan, dan budget Anda. Kami akan
            menyiapkan itinerary harian yang sesuai dengan kemampuan finansial
            Anda, termasuk opsi dream destination jika ingin merencanakan
            perjalanan impian.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-zinc-500">Lokasi sekarang</p>
                <p className="text-lg font-semibold text-zinc-900">
                  {locationLabel}
                </p>
              </div>
              <button
                type="button"
                onClick={handleUseLocation}
                className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-100"
              >
                {loadingLocation ? "Mencari..." : "Gunakan lokasi saya"}
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
                Kota tujuan
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
                Durasi (hari)
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
              Total budget perjalanan (IDR)
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
              Tampilkan opsi lanjutan (gaji & usia)
            </label>

            {showAdvanced && (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
                  Gaji per bulan (IDR)
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
                  Usia
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
              Ini dream destination, prioritaskan pengalaman terbaik
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
              Preferensi tambahan
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                placeholder="Contoh: suka kuliner lokal, ingin itinerary santai"
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
                ? "Menyusun rekomendasi..."
                : "Minta rekomendasi perjalanan"}
            </button>
          </form>

          <section className="flex flex-col gap-4 rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">
                Rekomendasi AI
              </h2>
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
                Output JSON
              </span>
            </div>
            {recommendation ? (
              <div className="flex flex-col gap-4">
                <div className="rounded-2xl bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
                  <p className="text-xs uppercase text-zinc-500">Ringkasan</p>
                  <p className="text-base font-semibold text-zinc-900">
                    {recommendation.summary}
                  </p>
                </div>
                <div className="grid gap-3 rounded-2xl border border-zinc-100 bg-white p-4">
                  <div>
                    <p className="text-xs uppercase text-zinc-500">Kota tujuan</p>
                    <p className="font-semibold text-zinc-900">
                      {recommendation.destination}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-zinc-500">
                      Estimasi budget harian
                    </p>
                    <p className="font-semibold text-zinc-900">
                      {recommendation.estimatedDailyBudget}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {recommendation.itinerary.map((day) => (
                    <div
                      key={day.day}
                      className="rounded-2xl border border-zinc-100 bg-white p-4"
                    >
                      <p className="text-xs uppercase text-zinc-500">
                        Hari {day.day}
                      </p>
                      <p className="text-base font-semibold text-zinc-900">
                        {day.title}
                      </p>
                      <p className="mt-2 text-sm text-zinc-600">
                        {day.description}
                      </p>
                      {day.budgetTips && (
                        <p className="mt-2 text-xs font-medium text-emerald-700">
                          {day.budgetTips}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
                  <div>
                    <p className="text-xs uppercase text-zinc-500">
                      Barang yang perlu dibawa
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-600">
                      {recommendation.packingList.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-zinc-500">Catatan aman</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-600">
                      {recommendation.safetyNotes.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-zinc-200 px-6 py-10 text-center text-sm text-zinc-500">
                <p className="text-base font-semibold text-zinc-700">
                  Belum ada rekomendasi.
                </p>
                <p>
                  Isi form di sebelah kiri dan minta rekomendasi perjalanan dari
                  AI.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
