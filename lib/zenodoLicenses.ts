import { useEffect, useSyncExternalStore } from "react";

/**
 * License IDs a recipe can use and still get a Zenodo DOI, published by
 * Neurodesk/apps.json (scripts/zenodo_licenses.py) next to the apps catalog:
 * Zenodo's license catalogue intersected with the SPDX IDs the NeuroContainers
 * builder accepts, in SPDX casing. `deprecated_aliases` are older SPDX IDs that
 * DOI publication maps onto a listed ID (e.g. GPL-3.0 -> GPL-3.0-only).
 * Anything else is a custom license with a name and URL.
 */
export interface ZenodoLicense {
  id: string;
  title: string;
  url: string | null;
  osi_approved: boolean;
}

export interface ZenodoLicenseList {
  licenses: ZenodoLicense[];
  deprecated_aliases: Record<string, string>;
}

export const LICENSES_URL =
  process.env.NEXT_PUBLIC_LICENSES_URL ||
  "https://apps-json.scigetorg.workers.dev/licenses/zenodo.json";

const STORAGE_KEY = "neurocontainers-ui:zenodo-licenses";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

let current: ZenodoLicenseList | null = null;
let pending: Promise<ZenodoLicenseList | null> | null = null;
const listeners = new Set<() => void>();

function isLicenseList(value: unknown): value is ZenodoLicenseList {
  const list = value as ZenodoLicenseList | null;
  return (
    !!list &&
    Array.isArray(list.licenses) &&
    list.licenses.length > 0 &&
    list.licenses.every(
      (entry) =>
        typeof entry?.id === "string" && typeof entry?.title === "string",
    ) &&
    !!list.deprecated_aliases &&
    typeof list.deprecated_aliases === "object"
  );
}

function readCache(): { savedAt: number; list: ZenodoLicenseList } | null {
  try {
    const cached = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return cached &&
      typeof cached.savedAt === "number" &&
      isLicenseList(cached.list)
      ? cached
      : null;
  } catch {
    return null;
  }
}

function writeCache(list: ZenodoLicenseList) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ savedAt: Date.now(), list }),
    );
  } catch {
    // Storage may be full or blocked; the list still works for this session.
  }
}

/** The loaded list, or null while loading or when it could not be fetched. */
export function getZenodoLicenses(): ZenodoLicenseList | null {
  return current;
}

/** Replace the loaded list (tests use this to inject a fixture). */
export function setZenodoLicenses(list: ZenodoLicenseList | null) {
  current = list;
  pending = null;
  listeners.forEach((listener) => listener());
}

/**
 * Fetch the list once per session. A cached copy younger than a day is used
 * without fetching; an older one is the fallback when the fetch fails.
 */
export function loadZenodoLicenses(
  fetchImpl: typeof fetch | undefined = globalThis.fetch,
) {
  if (current) return Promise.resolve(current);
  if (pending) return pending;
  const cached = readCache();
  if (cached && Date.now() - cached.savedAt < MAX_AGE_MS) {
    setZenodoLicenses(cached.list);
    return Promise.resolve(current);
  }
  if (typeof fetchImpl !== "function") {
    if (cached) setZenodoLicenses(cached.list);
    return Promise.resolve(current);
  }
  const request = fetchImpl(LICENSES_URL)
    .then((response) => (response.ok ? response.json() : null))
    .then((list: unknown) => {
      if (!isLicenseList(list)) throw new Error("Invalid license list");
      writeCache(list);
      return list;
    })
    .catch(() => cached?.list ?? null)
    .then((list) => {
      if (pending === request) {
        if (list) setZenodoLicenses(list);
        pending = null;
      }
      return current;
    });
  pending = request;
  return request;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The list for rendering; starts loading it on first use. */
export function useZenodoLicenses(): ZenodoLicenseList | null {
  useEffect(() => {
    void loadZenodoLicenses();
  }, []);
  return useSyncExternalStore(subscribe, getZenodoLicenses, () => null);
}

const lookups = new WeakMap<ZenodoLicenseList, Map<string, ZenodoLicense>>();

/** The listed license an ID (any case, or a deprecated alias) stands for. */
export function findZenodoLicense(
  list: ZenodoLicenseList,
  id: string,
): ZenodoLicense | undefined {
  let lookup = lookups.get(list);
  if (!lookup) {
    lookup = new Map(
      list.licenses.map((entry) => [entry.id.toLowerCase(), entry]),
    );
    for (const [alias, target] of Object.entries(list.deprecated_aliases)) {
      const entry = lookup.get(target.toLowerCase());
      if (entry) lookup.set(alias.toLowerCase(), entry);
    }
    lookups.set(list, lookup);
  }
  return lookup.get(id.trim().toLowerCase());
}
