"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function SearchBox() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = event.currentTarget.query.value;

    router.push(`/?q=${query}`);
  }

  return (
    <form onSubmit={handleSubmit} className="inline-flex gap-2 mb-4 max-h-10">
      <input
        defaultValue={searchParams.get("q") || ""}
        className="px-2 bg-neutral-200"
        name="query"
      />
      <button type="submit" className="p-2 bg-white/20">
        Search
      </button>
    </form>
  );
}
