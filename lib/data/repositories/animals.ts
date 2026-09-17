```tsx
import { createClient } from "@/lib/supabase/server";
import type { Animal, AnimalEvent } from "@/lib/data/mock/animals";

type AnimalRow = {
  id: string;
  tag: string;
  sex: string | null;
  date_of_birth: string | null;
  current_weight: number | null;
  weight_unit: string | null;
  location: string | null;
  status: string;
  species_id: string | null;
  breed_id: string | null;
};

type LookupRow = {
  id: string;
  name: string;
};

function calculateAge(dob: string): string {
  const birth = new Date(dob);
  const now = new Date();

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return years > 0 ? `${years}y ${months}m` : `${months}m`;
}

async function getLookupMaps() {
  const supabase = createClient();

  const [{ data: species }, { data: breeds }] = await Promise.all([
    supabase.from("species").select("id, name"),
    supabase.from("breeds").select("id, name"),
  ]);

  const speciesRows = (species ?? []) as LookupRow[];
  const breedRows = (breeds ?? []) as LookupRow[];

  const speciesMap = new Map(
    speciesRows.map((s) => [s.id, s.name])
  );

  const breedsMap = new Map(
    breedRows.map((b) => [b.id, b.name])
  );

  return { speciesMap, breedsMap };
}

function mapAnimalRow(
  row: AnimalRow,
  speciesMap: Map<string, string>,
  breedsMap: Map<string, string>
): Animal {
  return {
    id: row.id,
    tag: row.tag,
    species: (row.species_id && speciesMap.get(row.species_id)) || "—",
    breed: (row.breed_id && breedsMap.get(row.breed_id)) || "—",
    sex: (row.sex as "Male" | "Female") ?? "Male",
    dob: row.date_of_birth ?? "",
    ageLabel: row.date_of_birth ? calculateAge(row.date_of_birth) : "—",
    weight:
      row.current_weight != null
        ? `${row.current_weight} ${row.weight_unit ?? "kg"}`
        : "—",
    location: row.location ?? "—",
    status: (row.status as Animal["status"]) ?? "Active",
    events: [],
  };
}

export async function getAllAnimals(): Promise<Animal[]> {
  const supabase = createClient();

  const [{ data: rows, error }, { speciesMap, breedsMap }] =
    await Promise.all([
      supabase
        .from("animals")
        .select(
          "id, tag, sex, date_of_birth, current_weight, weight_unit, location, status, species_id, breed_id"
        )
        .order("tag"),
      getLookupMaps(),
    ]);

  if (error) {
    throw error;
  }

  return (rows ?? []).map((row) =>
    mapAnimalRow(row, speciesMap, breedsMap)
  );
}

export async function getAnimalById(
  id: string
): Promise<Animal | undefined> {
  const supabase = createClient();

  const [{ data: row, error }, { speciesMap, breedsMap }] =
    await Promise.all([
      supabase
        .from("animals")
        .select(
          "id, tag, sex, date_of_birth, current_weight, weight_unit, location, status, species_id, breed_id"
        )
        .eq("id", id)
        .single(),
      getLookupMaps(),
    ]);

  if (error || !row) {
    return undefined;
  }

  const { data: eventRows } = await supabase
    .from("animal_events")
    .select("event_date, event_type, detail")
    .eq("animal_id", id)
    .order("event_date", { ascending: false });

  const events: AnimalEvent[] = (eventRows ?? []).map((e) => ({
    date: e.event_date,
    type: e.event_type,
    detail: e.detail ?? "",
  }));

  return {
    ...mapAnimalRow(row, speciesMap, breedsMap),
    events,
  };
}
```

Then save it and run **only**:

```bash
npm run build
```

The previous `never` error should now be addressed, and we've removed the text that caused the syntax error.

Paste the next build output here.
