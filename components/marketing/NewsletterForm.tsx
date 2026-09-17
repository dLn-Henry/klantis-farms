"use client";

export function NewsletterForm() {
  return (
    <form
      className="flex gap-2.5 w-full sm:w-auto flex-shrink-0"
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        type="email"
        placeholder="Enter your email"
        className="bg-white/10 border border-white/20 text-white placeholder:text-[#9DB3A6] rounded-md px-4 py-3 text-[13.5px] w-full sm:w-60"
      />
      <button type="submit" className="bg-gold text-forest font-extrabold text-sm px-5 py-3 rounded-md whitespace-nowrap">
        Subscribe
      </button>
    </form>
  );
}
