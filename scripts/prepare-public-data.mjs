import { copyFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const files = [
  "units.csv",
  "subunits.csv",
  "academic_teams.csv",
  "roles.csv",
  "people.csv",
  "assignments.csv"
];
const target = join(process.cwd(), "public", "database");

await mkdir(target, { recursive: true });
await Promise.all(files.map(file =>
  copyFile(join(process.cwd(), "database", file), join(target, file))
));
