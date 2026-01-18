import Image from "next/image";

type HomeHeaderProps = {
  username: string;
};

export const HomeHeader = ({ username }: HomeHeaderProps) => (
  <header className="flex flex-col gap-3">
    <div className="flex items-center gap-3">
      <Image
        src="/budvisory-ai-logo.svg"
        alt="Budvisory-AI"
        width={180}
        height={56}
        className="h-10 w-auto"
        priority
      />
    </div>
    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
      Budvisory AI
    </p>
    <p className="text-sm font-medium text-zinc-500">
      Welcome back, {username || "traveler"}.
    </p>
    <h1 className="text-4xl font-semibold leading-tight text-zinc-900 sm:text-5xl">
      Plan domestic travel in Indonesia with a realistic budget.
    </h1>
    <p className="max-w-3xl text-base leading-7 text-zinc-600">
      Choose a destination city, trip length, and your budget. We'll prepare a
      day-by-day itinerary that fits your finances, including a dream
      destination option if you're planning a wishlist trip.
    </p>
  </header>
);
