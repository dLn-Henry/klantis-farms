"use client";

import { MODULE_LABELS, summarizePermissions } from "@/lib/data/permission-labels";
import type { RoleInfo } from "@/lib/data/repositories/roles";

// A person can hold several roles; what they can do is the combination.
// Used by "Add team member" (uncontrolled, submits name="roles") and by the
// member controls (controlled via value/onChange).
export function RolePicker({
  roles,
  value,
  onChange,
  disabled,
}: {
  roles: RoleInfo[];
  value?: string[];
  onChange?: (next: string[]) => void;
  disabled?: boolean;
}) {
  const controlled = value !== undefined;
  const toggle = (name: string, on: boolean) => {
    if (!onChange || !value) return;
    onChange(on ? [...value, name] : value.filter((v) => v !== name));
  };

  return (
    <fieldset className="space-y-2" disabled={disabled}>
      <legend className="sr-only">Roles</legend>
      {roles.map((r) => {
        const summary = summarizePermissions(r.permissions);
        return (
          <label
            key={r.name}
            className="flex items-start gap-3 border border-border rounded-md px-3.5 py-3 bg-white cursor-pointer hover:border-green has-[:checked]:border-green has-[:checked]:bg-mist"
          >
            <input
              type="checkbox"
              name="roles"
              value={r.name}
              className="mt-1 accent-[#1F6B45]"
              {...(controlled
                ? { checked: value!.includes(r.name), onChange: (e) => toggle(r.name, e.target.checked) }
                : { defaultChecked: r.name === "Farm Worker" })}
            />
            <span className="min-w-0">
              <b className="text-sm font-bold block">{r.name}</b>
              {r.description && <span className="text-xs text-ink-soft block">{r.description}</span>}
              <span className="text-[11.5px] text-ink-soft block mt-1">
                {summary.slice(0, 6).map((s) => MODULE_LABELS[s.module] ?? s.module).join(" · ")}
                {summary.length > 6 ? ` · +${summary.length - 6} more` : ""}
              </span>
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
