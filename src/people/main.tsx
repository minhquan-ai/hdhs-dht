import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import "@/index.css";

function PeopleSearch() {
  useEffect(() => {
    void import("../../people/people.js");
  }, []);

  return (
    <label className="search-field" htmlFor="people-query">
      <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
        <circle cx="10.8" cy="10.8" r="6.8" />
        <path d="m16 16 5 5" />
      </svg>
      <span className="sr-only">Tìm theo tên hoặc lớp</span>
      <Input
        id="people-query"
        type="search"
        inputMode="search"
        autoComplete="off"
        placeholder="Tìm theo tên hoặc lớp"
        aria-describedby="search-hint"
        className="people-search-input"
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
        <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
          <path d="m7 7 10 10M17 7 7 17" />
        </svg>
      </Button>
    </label>
  );
}

const root = document.getElementById("people-search-root");
if (root) createRoot(root).render(<PeopleSearch />);
