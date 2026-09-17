export type AnimalStatus = "Active" | "Sick" | "Pregnant" | "Quarantined" | "Sold" | "Deceased";

export type AnimalEvent = {
  date: string;
  type: string;
  detail: string;
};

export type Animal = {
  id: string;
  tag: string;
  species: string;
  breed: string;
  sex: "Male" | "Female";
  dob: string;
  ageLabel: string;
  weight: string;
  location: string;
  status: AnimalStatus;
  events: AnimalEvent[];
};

export const animals: Animal[] = [
  {
    id: "klf-cow-0012",
    tag: "KLF-COW-0012",
    species: "Cattle",
    breed: "Sanga",
    sex: "Female",
    dob: "2022-03-14",
    ageLabel: "3y 6m",
    weight: "412 kg",
    location: "East Pasture",
    status: "Pregnant",
    events: [
      { date: "2026-08-11", type: "Health Check", detail: "Routine examination — no issues" },
      { date: "2026-07-02", type: "Breeding", detail: "Breeding recorded with KLF-BUL-0004" },
      { date: "2026-04-20", type: "Vaccination", detail: "Annual vaccination administered" },
      { date: "2022-03-14", type: "Birth", detail: "Born on farm — East Pasture" },
    ],
  },
  {
    id: "klf-cow-0013",
    tag: "KLF-COW-0013",
    species: "Cattle",
    breed: "Sanga",
    sex: "Female",
    dob: "2021-11-02",
    ageLabel: "4y 10m",
    weight: "438 kg",
    location: "East Pasture",
    status: "Active",
    events: [
      { date: "2026-08-05", type: "Weight", detail: "Weight recorded: 438 kg" },
      { date: "2026-06-14", type: "Vaccination", detail: "Annual vaccination administered" },
    ],
  },
  {
    id: "klf-bul-0004",
    tag: "KLF-BUL-0004",
    species: "Cattle",
    breed: "Sanga",
    sex: "Male",
    dob: "2020-05-19",
    ageLabel: "6y 3m",
    weight: "560 kg",
    location: "West Pasture",
    status: "Active",
    events: [
      { date: "2026-07-02", type: "Breeding", detail: "Breeding recorded with KLF-COW-0012" },
    ],
  },
  {
    id: "klf-cow-0021",
    tag: "KLF-COW-0021",
    species: "Cattle",
    breed: "Zebu Cross",
    sex: "Female",
    dob: "2023-01-30",
    ageLabel: "2y 8m",
    weight: "301 kg",
    location: "East Pasture",
    status: "Sick",
    events: [
      { date: "2026-08-14", type: "Treatment", detail: "Treatment started — respiratory infection" },
      { date: "2026-08-13", type: "Veterinary Visit", detail: "Veterinary report submitted, pending review" },
    ],
  },
  {
    id: "klf-cow-0028",
    tag: "KLF-COW-0028",
    species: "Cattle",
    breed: "Sanga",
    sex: "Female",
    dob: "2019-09-08",
    ageLabel: "7y",
    weight: "445 kg",
    location: "Quarantine Pen",
    status: "Quarantined",
    events: [
      { date: "2026-08-10", type: "Transfer", detail: "Moved to quarantine pen for observation" },
    ],
  },
];

export const speciesFilters = ["All", "Cattle"];
export const statusFilters: AnimalStatus[] = ["Active", "Sick", "Pregnant", "Quarantined", "Sold", "Deceased"];
