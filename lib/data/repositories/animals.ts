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

  if (years > 0) {
    return `${years}y ${months}m`;
  }

  return `${months}m`;
}

async function getLookupMaps() {
  const supabase = createClient();

  const speciesResult = await supabase
    .from("species")
    .select("id, name");

  const breedsResult = await supabase
    .from("breeds")
    .select("id, name");

  const speciesRows = (speciesResult.data ?? []) as LookupRow[];
  const breedRows = (breedsResult.data ?? []) as LookupRow[];

  const speciesMap = new Map<string, string>();

  for (const species of speciesRows) {
    speciesMap.set(species.id, species.name);
  }

  const breedsMap = new Map<string, string>();

  for (const breed of breedRows) {
    breedsMap.set(breed.id, breed.name);
  }

  return {
    speciesMap,
    breedsMap,
  };
}

function mapAnimalRow(
  row: AnimalRow,
  speciesMap: Map<string, string>,
  breedsMap: Map<string, string>
): Animal {
  return {
    id: row.id,
    tag: row.tag,
    species: row.species_id
      ? speciesMap.get(row.species_id) ?? "—"
      : "—",
    breed: row.breed_id
      ? breedsMap.get(row.breed_id) ?? "—"
      : "—",
    sex: (row.sex as "Male" | "Female") ?? "Male",
    dob: row.date_of_birth ?? "",
    ageLabel: row.date_of_birth
      ? calculateAge(row.date_of_birth)
      : "—",
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

  const animalsResult = await supabase
    .from("animals")
    .select(
      "id, tag, sex, date_of_birth, current_weight, weight_unit, location, status, species_id, breed_id"
    )
    .order("tag");

  const { speciesMap, breedsMap } = await getLookupMaps();

  if (animalsResult.error) {
    throw animalsResult.error;
  }

  const rows = (animalsResult.data ?? []) as AnimalRow[];

  return rows.map((row) =>
    mapAnimalRow(row, speciesMap, breedsMap)
  );
}

export async function getAnimalById(
  id: string
): Promise<Animal | undefined> {
  const supabase = createClient();

  const animalResult = await supabase
    .from("animals")
    .select(
      "id, tag, sex, date_of_birth, current_weight, weight_unit, location, status, species_id, breed_id"
    )
    .eq("id", id)
    .single();

  const { speciesMap, breedsMap } = await getLookupMaps();

  if (animalResult.error || !animalResult.data) {
    return undefined;
  }

  const eventResult = await supabase
    .from("animal_events")
    .select("event_date, event_type, detail")
    .eq("animal_id", id)
    .order("event_date", { ascending: false });

  const eventRows = eventResult.data ?? [];

  const events: AnimalEvent[] = eventRows.map((event) => ({
    date: event.event_date,
    type: event.event_type,
    detail: event.detail ?? "",
  }));

  const row = animalResult.data as AnimalRow;

  return {
    ...mapAnimalRow(row, speciesMap, breedsMap),
    events,
  };
}
```

### Then run

```bash
npm run build
```

**Important:** If this still reports a **Syntax Error**, don't make another change. Paste the error from the **first line that says `./lib/data/repositories/animals.ts` through the `Caused by:` section**. At that point we'll check whether the actual file being built differs from what you're editing.
