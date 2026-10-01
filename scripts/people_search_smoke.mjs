import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../people/people.js", import.meta.url), "utf8");
const elements = new Map();

function element(selector) {
  if (!elements.has(selector)) {
    elements.set(selector, {
      value: "",
      innerHTML: "",
      hidden: false,
      textContent: "",
      listeners: new Map(),
      addEventListener(name, handler) { this.listeners.set(name, handler); },
      focus() {}
    });
  }
  return elements.get(selector);
}

const csv = {
  "units.csv": "id,name,sort_order\nu1,CLB,1\n",
  "subunits.csv": "id,name,sort_order\n",
  "academic_teams.csv": "id,name,sort_order\n",
  "roles.csv": "id,title\nr1,Thành viên\n",
  "people.csv": "id,name,class_name\np1,Quân,12A1\np2,Nguyễn,12A1\np3,Đặng,12A1\n",
  "assignments.csv": "id,person_id,unit_id,role_id,role_label,status,sort_order\na1,p1,u1,r1,,active,1\na2,p2,u1,r1,,active,2\na3,p3,u1,r1,,active,3\n"
};

const fetch = async url => {
  const name = String(url).split("/").at(-1).split("?")[0];
  assert.ok(Object.hasOwn(csv, name), `unexpected CSV request: ${name}`);
  return { ok: true, text: async () => csv[name] };
};

vm.runInNewContext(source, {
  document: { querySelector: element },
  fetch,
  URLSearchParams
});

for (let attempt = 0; attempt < 10 && element("#result-count").textContent !== "3 người"; attempt++) {
  await new Promise(resolve => setTimeout(resolve, 0));
}
assert.equal(element("#result-count").textContent, "3 người", "fixture directory should load");

for (const [query, expectedName] of [["quan", "Quân"], ["nguyen", "Nguyễn"], ["dang", "Đặng"]]) {
  element("#people-query").value = query;
  element("#people-query").listeners.get("input")();
  assert.equal(element("#result-count").textContent, "1 người", `${query} should match exactly one person`);
  assert.ok(
    element("#people-results").innerHTML.includes(`<strong>${expectedName}</strong>`),
    `${query} should render the original name ${expectedName}`
  );
}

console.log("PASS: unaccented search for quan, nguyen, dang preserves Vietnamese display names");
