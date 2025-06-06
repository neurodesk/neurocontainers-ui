interface Package {
    name: string;
    description: string;
}

class PackageDatabase {
    private static instance: PackageDatabase | null = null;
    private packages: Package[] | null = null;
    private loadingPromise: Promise<Package[]> | null = null;

    private constructor() { }

    static getInstance(): PackageDatabase {
        if (!PackageDatabase.instance) {
            PackageDatabase.instance = new PackageDatabase();
        }
        return PackageDatabase.instance;
    }

    async load(): Promise<Package[]> {
        if (this.packages) {
            return this.packages;
        }

        if (this.loadingPromise) {
            return this.loadingPromise;
        }

        this.loadingPromise = this.loadPackages();
        return this.loadingPromise;
    }

    private async loadPackages(): Promise<Package[]> {
        try {
            const { default: packages } = (await import(
                "./packages/ubuntu_noble_amd64.json"
            )) as {
                default: Package[];
            };

            this.packages = packages;
            this.loadingPromise = null;
            return packages;
        } catch (error) {
            this.loadingPromise = null;
            throw new Error(`Failed to load package database: ${error}`);
        }
    }

    search(query: string, limit = 10): Package[] {
        if (!this.packages || !query || query.length < 2) return [];

        const lowerQuery = query.toLowerCase();
        const results: Package[] = [];
        const seen = new Set<string>();

        // Helper to add unique results
        const addResult = (pkg: Package): boolean => {
            if (!seen.has(pkg.name)) {
                seen.add(pkg.name);
                results.push(pkg);
                return results.length < limit;
            }
            return true;
        };

        // Search passes with early termination
        const searchPasses = [
            (pkg: Package) => pkg.name === lowerQuery,
            (pkg: Package) => pkg.name.startsWith(lowerQuery),
            (pkg: Package) => pkg.name.includes(lowerQuery),
            (pkg: Package) => pkg.description?.toLowerCase().includes(lowerQuery),
        ];

        for (const condition of searchPasses) {
            for (const pkg of this.packages) {
                if (condition(pkg) && !addResult(pkg)) {
                    return results;
                }
            }
        }

        return results;
    }

    isLoaded(): boolean {
        return this.packages !== null;
    }
}

// Export convenience functions
export async function loadPackageDatabase(): Promise<Package[]> {
    return PackageDatabase.getInstance().load();
}

export async function searchPackages(
    query: string,
    limit = 10
): Promise<Package[]> {
    const db = PackageDatabase.getInstance();
    await db.load();
    return db.search(query, limit);
}

export function searchPackagesSync(query: string, limit = 10): Package[] {
    const db = PackageDatabase.getInstance();
    if (!db.isLoaded()) {
        throw new Error("Package database not loaded. Call loadPackageDatabase() first.");
    }
    return db.search(query, limit);
}