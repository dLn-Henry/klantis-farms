"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ContactForm() {
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="grid sm:grid-cols-2 gap-4.5 mb-4.5">
        <div>
          <label className="text-xs font-bold block mb-1.5">Full Name</label>
          <input type="text" placeholder="Your name" className="w-full border border-border rounded-lg px-3.5 py-3 text-sm focus:outline-none focus:border-green" />
        </div>
        <div>
          <label className="text-xs font-bold block mb-1.5">Phone Number</label>
          <input type="tel" placeholder="+233 ..." className="w-full border border-border rounded-lg px-3.5 py-3 text-sm focus:outline-none focus:border-green" />
        </div>
      </div>
      <div className="mb-4.5">
        <label className="text-xs font-bold block mb-1.5">Email Address</label>
        <input type="email" placeholder="you@example.com" className="w-full border border-border rounded-lg px-3.5 py-3 text-sm focus:outline-none focus:border-green" />
      </div>
      <div className="mb-4.5">
        <label className="text-xs font-bold block mb-1.5">Subject</label>
        <input type="text" placeholder="e.g. Bulk order enquiry" className="w-full border border-border rounded-lg px-3.5 py-3 text-sm focus:outline-none focus:border-green" />
      </div>
      <div className="mb-4.5">
        <label className="text-xs font-bold block mb-1.5">Message</label>
        <textarea rows={5} placeholder="Tell us what you need..." className="w-full border border-border rounded-lg px-3.5 py-3 text-sm focus:outline-none focus:border-green" />
      </div>
      <Button type="submit">Send Message <ArrowRight size={15} /></Button>
    </form>
  );
}
