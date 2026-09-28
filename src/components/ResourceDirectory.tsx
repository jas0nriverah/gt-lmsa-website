"use client";

import { useMemo, useState } from "react";
import type { Resource, ResourceCategory } from "@/lib/site-types";

function ResourceLinkCard({ resource }: { resource: Resource }) {
  return (
    <article className="resource-entry flex h-full flex-col border-t border-gt-gold/50 pt-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-gt-dark-gold">
          {resource.category}
        </span>
        {resource.timeSensitive ? (
          <span className="rounded-sm bg-amber-50 px-2 py-1 text-[0.68rem] font-bold uppercase tracking-wide text-amber-800 ring-1 ring-amber-200">
            Check current details
          </span>
        ) : null}
      </div>
      <h3 className="mt-3 text-lg font-bold leading-snug text-gt-navy">{resource.title}</h3>
      <p className="mt-1 text-sm font-semibold text-slate-500">{resource.organization}</p>
      <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{resource.description}</p>
      <a
        href={resource.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-link mt-5 inline-flex w-fit items-center rounded-sm text-sm font-bold"
      >
        Visit official resource <span aria-hidden="true" className="ml-2">↗</span>
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </article>
  );
}

export function ResourceDirectory({ categories }: { categories: ResourceCategory[] }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All resources");
  const categoryNames = ["All resources", ...categories.map(({ category }) => category)];
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredCategories = useMemo(() => categories
    .map((group) => ({
      ...group,
      items: group.items.filter((resource) => {
        const matchesCategory = activeCategory === "All resources" || group.category === activeCategory;
        const searchable = [
          resource.title,
          resource.description,
          resource.organization,
          resource.category,
          group.category,
        ].join(" ").toLocaleLowerCase();
        return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
      }),
    }))
    .filter((group) => group.items.length > 0), [activeCategory, categories, normalizedQuery]);
  const resultCount = filteredCategories.reduce((count, group) => count + group.items.length, 0);

  return (
    <div>
      <div className="grid gap-5 border-b border-slate-200 pb-6 md:grid-cols-[minmax(16rem,0.75fr)_1.25fr] md:items-end">
        <div>
          <label htmlFor="resource-search" className="block text-sm font-bold text-gt-navy">
            Search the directory
          </label>
          <input
            id="resource-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try advising, research, MCAT…"
            className="mt-2 min-h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-base text-ink placeholder:text-slate-400"
          />
        </div>
        <div>
          <p className="mb-2 text-sm font-bold text-gt-navy" id="resource-categories-label">
            Browse by category
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-labelledby="resource-categories-label">
            {categoryNames.map((category) => {
              const selected = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full border px-3 py-2 text-sm font-semibold transition-colors ${
                    selected
                      ? "border-gt-navy bg-gt-navy text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:border-gt-gold hover:text-gt-navy"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <p className="mt-5 text-sm text-slate-600" aria-live="polite">
        {resultCount} {resultCount === 1 ? "resource" : "resources"}
        {activeCategory !== "All resources" ? ` in ${activeCategory}` : ""}
        {normalizedQuery ? ` matching “${query.trim()}”` : ""}
      </p>

      {filteredCategories.length ? (
        <div className="mt-8 space-y-12">
          {filteredCategories.map((group) => (
            <section key={group.category} aria-labelledby={`resource-group-${categorySlug(group.category)}`}>
              <div className="mb-6 max-w-3xl">
                <h3 id={`resource-group-${categorySlug(group.category)}`} className="text-2xl font-bold text-gt-navy">
                  {group.category}
                </h3>
                <p className="mt-2 leading-7 text-slate-600">{group.description}</p>
              </div>
              <div className="grid gap-x-7 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((resource) => (
                  <ResourceLinkCard key={resource.href} resource={resource} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="font-bold text-gt-navy">No matching resources</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">Try another search or choose a different category.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setActiveCategory("All resources");
            }}
            className="text-link mt-4 rounded-sm font-bold"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

function categorySlug(value: string) {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
