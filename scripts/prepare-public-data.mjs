import { copyFile, mkdir } from "node:fs/promises";

const files = [
  "units.csv",
  "subunits.csv",
  "academic_teams.csv",
  "roles.csv",
  "people.csv",
  "assignments.csv",
];

await mkdir("public/database", { recursive: true });
await Promise.all(files.map(file => copyFile(`database/${file}`, `public/database/${file}`)));
