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
    years = years - 1;
    months = months + 12;
  }

  if (years > 0) {
    return String(years) + "y " + String(months) + "m";
  }

  return String(months) + "m";
}

async function getLookupMaps() {
  const supabase = createClient();

  const speciesResult = await supabase
    .from("species")
    .select("id, name");

  const breedsResult = await supabase
    .from("breeds")
    .select("id, name");

  const speciesRows = (speciesResult.data || []) as LookupRow[];
  const breedRows = (breedsResult.data || []) as LookupRow[];

  const speciesMap = new Map<string, string>();
  const breedsMap = new Map<string, string>();

  speciesRows.forEach((species) => {
    speciesMap.set(species.id, species.name);
  });

  breedRows.forEach((breed) => {
    breedsMap.set(breed.id, breed.name);
  });

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
  const species =
    row.species_id && speciesMap.has(row.species_id)
      ? speciesMap.get(row.species_id) || "—"
      : "—";

  const breed =
    row.breed_id && breedsMap.has(row.breed_id)
      ? breedsMap.get(row.breed_id) || "—"
      : "—";

  const weight =
    row.current_weight !== null
      ? String(row.current_weight) + " " + (row.weight_unit || "kg")
      : "—";

  return {
    id: row.id,
    tag: row.tag,
    species: species,
    breed: breed,
    sex: (row.sex as "Male" | "Female") || "Male",
    dob: row.date_of_birth || "",
    ageLabel: row.date_of_birth ? calculateAge(row.date_of_birth) : "—",
    weight: weight,
    location: row.location || "—",
    status: (row.status as Animal["status"]) || "Active",
    events: [],
  };
}

export async function getAllAnimals(): Promise<Animal[]> {
  const supabase = createClient();

  const result = await supabase
    .from("animals")
    .select(
      "id, tag, sex, date_of_birth, current_weight, weight_unit, location, status, species_id, breed_id"
    )
    .order("tag");

  if (result.error) {
    throw result.error;
  }

  const lookupMaps = await getLookupMaps();
  const rows = (result.data || []) as AnimalRow[];

  return rows.map((row) =>
    mapAnimalRow(row, lookupMaps.speciesMap, lookupMaps.breedsMap)
  );
}

export async function getAnimalById(
  id: string
): Promise<Animal | undefined> {
  const supabase = createClient();

  const result = await supabase
    .from("animals")
    .select(
      "id, tag, sex, date_of_birth, current_weight, weight_unit, location, status, species_id, breed_id"
    )
    .eq("id", id)
    .single();

  if (result.error || !result.data) {
    return undefined;
  }

  const lookupMaps = await getLookupMaps();

  const eventResult = await supabase
    .from("animal_events")
    .select("event_date, event_type, detail")
    .eq("animal_id", id)
    .order("event_date", { ascending: false });

  const events: AnimalEvent[] = (eventResult.data || []).map((event) => ({
    date: event.event_date,
    type: event.event_type,
    detail: event.detail || "",
  }));

  const row = result.data as AnimalRow;

  return {
    ...mapAnimalRow(row, lookupMaps.speciesMap, lookupMaps.breedsMap),
    events,
  };
}
```

### Then save it

In VS Code:

**Ctrl + S**

Then run:

```bash
npm run build
```

### One important thing

If you **still get a syntax error pointing at this file**, I don't want you to keep replacing code. At that point, we'll inspect the actual file encoding/characters or the build environment, because this code itself contains nothing syntactically unusual.

Paste the next build output exactly as Vercel gives it.
