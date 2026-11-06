import { findZenodoLicense, getZenodoLicenses, loadZenodoLicenses, setZenodoLicenses } from "@/lib/zenodoLicenses";
import { zenodoLicenseFixture } from "@/jest.mocks/zenodoLicenses";

const STORAGE_KEY = "neurocontainers-ui:zenodo-licenses";
const respond = (body: unknown, ok = true) =>
    jest.fn().mockResolvedValue({ ok, json: async () => body }) as unknown as typeof fetch;

beforeEach(() => {
    setZenodoLicenses(null);
    localStorage.clear();
});

describe("Zenodo license list", () => {
    it("fetches the list once and caches it", async () => {
        const fetchImpl = respond(zenodoLicenseFixture);
        await expect(loadZenodoLicenses(fetchImpl)).resolves.toEqual(zenodoLicenseFixture);
        await loadZenodoLicenses(fetchImpl);
        expect(fetchImpl).toHaveBeenCalledTimes(1);
        expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).list).toEqual(zenodoLicenseFixture);
    });

    it("uses a fresh cached copy without fetching", async () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ savedAt: Date.now(), list: zenodoLicenseFixture }));
        const fetchImpl = respond(null);
        await expect(loadZenodoLicenses(fetchImpl)).resolves.toEqual(zenodoLicenseFixture);
        expect(fetchImpl).not.toHaveBeenCalled();
    });

    it("falls back to a stale cached copy when the fetch fails", async () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ savedAt: 0, list: zenodoLicenseFixture }));
        const fetchImpl = jest.fn().mockRejectedValue(new Error("offline")) as unknown as typeof fetch;
        await expect(loadZenodoLicenses(fetchImpl)).resolves.toEqual(zenodoLicenseFixture);
    });

    it("stays unavailable when the response is not a license list", async () => {
        await expect(loadZenodoLicenses(respond({ licenses: [] }))).resolves.toBeNull();
        await expect(loadZenodoLicenses(respond(zenodoLicenseFixture, false))).resolves.toBeNull();
        expect(getZenodoLicenses()).toBeNull();
    });

    it("finds listed IDs in any case and through deprecated aliases", () => {
        expect(findZenodoLicense(zenodoLicenseFixture, "mit")?.id).toBe("MIT");
        expect(findZenodoLicense(zenodoLicenseFixture, "GPL-3.0")?.id).toBe("GPL-3.0-only");
        expect(findZenodoLicense(zenodoLicenseFixture, "BSD-2-Clause-FreeBSD")).toBeUndefined();
    });
});
