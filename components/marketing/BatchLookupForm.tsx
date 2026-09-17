"use client";

export function BatchLookupForm() {
  return (
    <form className="flex gap-2.5 max-w-md mx-auto mt-5" onSubmit={(e) => e.preventDefault()}>
      <input
        type="text"
        placeholder="e.g. KLF-MNG-2026-014"
        className="flex-1 bg-white/10 border border-white/20 text-white placeholder:text-[#9DB3A6] rounded-md px-4 py-3 text-[13.5px]"
      />
      <button type="submit" className="bg-gold text-forest font-extrabold text-sm px-5 py-3 rounded-md whitespace-nowrap">
        Look Up
      </button>
    </form>
  );
}
