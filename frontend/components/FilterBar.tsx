"use client";

import { Dispatch, SetStateAction } from "react";

interface FilterBarProps {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  severityFilter: string;
  setSeverityFilter: Dispatch<SetStateAction<string>>;
  statusFilter: string;
  setStatusFilter: Dispatch<SetStateAction<string>>;
  sortOrder: string;
  setSortOrder: Dispatch<SetStateAction<string>>;
}

export default function FilterBar({
  search,
  setSearch,
  severityFilter,
  setSeverityFilter,
  statusFilter,
  setStatusFilter,
  sortOrder,
  setSortOrder,
}: FilterBarProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-md border border-asphalt-lighter bg-asphalt-light p-4 md:flex-row md:items-center">
      <div className="flex-1">
        <label htmlFor="search" className="sr-only">Search</label>
        <input
          id="search"
          type="text"
          placeholder="Search damage type or location..."
          className="w-full rounded bg-asphalt px-3 py-2 text-sm text-concrete outline-none focus:ring-1 focus:ring-signal-amber"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex flex-col flex-wrap gap-4 sm:flex-row sm:items-center md:gap-4">
        <div className="w-full sm:w-auto">
          <label htmlFor="severity" className="sr-only">Severity</label>
          <select
            id="severity"
            className="w-full sm:w-auto rounded bg-asphalt px-3 py-2 text-sm text-concrete outline-none focus:ring-1 focus:ring-signal-amber"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="all">All Severities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="w-full sm:w-auto">
          <label htmlFor="status" className="sr-only">Status</label>
          <select
            id="status"
            className="w-full sm:w-auto rounded bg-asphalt px-3 py-2 text-sm text-concrete outline-none focus:ring-1 focus:ring-signal-amber"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="w-full sm:w-auto">
          <label htmlFor="sort" className="sr-only">Sort By</label>
          <select
            id="sort"
            className="w-full sm:w-auto rounded bg-asphalt px-3 py-2 text-sm text-concrete outline-none focus:ring-1 focus:ring-signal-amber"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      </div>
    </div>
  );
}
