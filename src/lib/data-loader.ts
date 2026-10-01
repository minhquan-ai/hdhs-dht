import unitsRaw from "../../database/units.csv?raw";
import subunitsRaw from "../../database/subunits.csv?raw";
import academicRaw from "../../database/academic_teams.csv?raw";
import rolesRaw from "../../database/roles.csv?raw";
import peopleRaw from "../../database/people.csv?raw";
import assignmentsRaw from "../../database/assignments.csv?raw";

export interface Unit {
  id: string;
  parent_id: string;
  name: string;
  kind: string;
  sort_order: string;
  summary: string;
  status: string;
}

export interface Role {
  id: string;
  unit_id: string;
  title: string;
  sort_order: string;
  summary: string;
}

export interface Person {
  id: string;
  name: string;
  class_name: string;
}

export interface Assignment {
  id: string;
  person_id: string;
  unit_id: string;
  role_id: string;
  role_label: string;
  status: string;
  sort_order: string;
}

export interface EnrichedUnit extends Unit {
  roles: Role[];
  members: { person: Person; assignment: Assignment; roleTitle: string }[];
  subUnits: EnrichedUnit[];
  leaderName?: string;
  memberCount: number;
}

export function parseCSV<T = Record<string, string>>(text: string): T[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        quoted = false;
      } else {
        cell += ch;
      }
    } else {
      if (ch === '"') {
        quoted = true;
      } else if (ch === ",") {
        row.push(cell);
        cell = "";
      } else if (ch === "\n") {
        row.push(cell);
        rows.push(row);
        row = [];
        cell = "";
      } else if (ch !== "\r") {
        cell += ch;
      }
    }
  }

  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }

  if (!rows.length) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows
    .slice(1)
    .filter((r) => r.some((x) => String(x).trim() !== ""))
    .map(
      (r) =>
        Object.fromEntries(
          headers.map((h, i) => [h, (r[i] ?? "").trim()])
        ) as unknown as T
    );
}

export function loadStaticData() {
  const units = [
    ...parseCSV<Unit>(unitsRaw),
    ...parseCSV<Unit>(subunitsRaw),
    ...parseCSV<Unit>(academicRaw),
  ];
  const roles = parseCSV<Role>(rolesRaw);
  const people = parseCSV<Person>(peopleRaw);
  const assignments = parseCSV<Assignment>(assignmentsRaw);

  const roleMap = new Map<string, Role>(roles.map((r) => [r.id, r]));
  const personMap = new Map<string, Person>(people.map((p) => [p.id, p]));

  // Build enriched units
  const enrichedMap = new Map<string, EnrichedUnit>();
  units.forEach((u) => {
    enrichedMap.set(u.id, {
      ...u,
      roles: roles.filter((r) => r.unit_id === u.id),
      members: [],
      subUnits: [],
      memberCount: 0,
    });
  });

  assignments.forEach((a) => {
    const unitNode = enrichedMap.get(a.unit_id);
    const person = personMap.get(a.person_id);
    if (unitNode && person) {
      const role = roleMap.get(a.role_id);
      const roleTitle = a.role_label || role?.title || "Thành viên";
      unitNode.members.push({ person, assignment: a, roleTitle });
      if (!unitNode.leaderName && (roleTitle.toLowerCase().includes("trưởng") || roleTitle.toLowerCase().includes("chủ nhiệm") || roleTitle.toLowerCase().includes("chủ tịch"))) {
        unitNode.leaderName = person.name;
      }
    }
  });

  // Calculate unique members
  enrichedMap.forEach((u) => {
    u.memberCount = new Set(u.members.map((m) => m.person.id)).size;
  });

  // Attach sub-units
  const rootUnits: EnrichedUnit[] = [];
  units.forEach((u) => {
    const node = enrichedMap.get(u.id)!;
    if (u.parent_id && enrichedMap.has(u.parent_id)) {
      enrichedMap.get(u.parent_id)!.subUnits.push(node);
    } else {
      rootUnits.push(node);
    }
  });

  return {
    units,
    roles,
    people,
    assignments,
    enrichedUnits: Array.from(enrichedMap.values()),
    rootUnits,
  };
}
