import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m16 16 5 5" />
    </svg>
  );
}

function PeopleSearch() {
  useEffect(() => {
    const filters = document.querySelector<HTMLDetailsElement>("#filter-panel");
    const desktop = window.matchMedia("(min-width: 701px)");
    const syncFilters = () => {
      if (filters) filters.open = desktop.matches;
    };

    syncFilters();
    desktop.addEventListener("change", syncFilters);
    void import("../../people/people.js");
    return () => desktop.removeEventListener("change", syncFilters);
  }, []);

  return (
    <form id="people-search-form" className="people-search" role="search">
      <label className="search-field" htmlFor="people-query">
        <SearchIcon />
        <span className="sr-only">Tìm theo tên hoặc lớp</span>
        <Input
          id="people-query"
          type="search"
          inputMode="search"
          autoComplete="off"
          placeholder="Tìm theo tên hoặc lớp"
          aria-describedby="search-hint"
        />
        <Button
          id="clear-search"
          type="button"
          variant="ghost"
          size="icon-lg"
          className="clear-search"
          aria-label="Xóa nội dung tìm kiếm"
          hidden
        >
          ×
        </Button>
      </label>
      <p id="search-hint" className="search-hint">
        Một người chỉ có một hồ sơ, kể cả khi tham gia nhiều đơn vị.
      </p>
    </form>
  );
}

const root = document.getElementById("people-search-root");
if (root) createRoot(root).render(<PeopleSearch />);
