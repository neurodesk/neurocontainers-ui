// services/githubService.ts
import type {
    BuildYamlFile,
    CachedData,
    GitHubTreeResponse,
    GitHubBranchResponse,
    GitHubTreeItem,
} from '@/types/github';

const CACHE_KEY = 'github-build-yaml-files';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface GitHubCommit {
    sha: string;
    commit: {
        author: {
            name: string;
            email: string;
            date: string;
        };
        message: string;
    };
    html_url: string;
}

interface RepositoryInfo {
    lastCommit: {
        message: string;
        author: string;
        date: string;
        sha: string;
        htmlUrl: string;
    };
}

class GitHubService {
    private async fetchWithAuth(url: string): Promise<Response> {
        const headers: HeadersInit = {
            Accept: 'application/vnd.github.v3+json',
        };

        if (process.env.NEXT_PUBLIC_GITHUB_TOKEN) {
            headers.Authorization = `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`;
        }

        const response = await fetch(url, { headers });

        if (!response.ok) {
            throw new Error(
                `GitHub API error: ${response.status} ${response.statusText}`
            );
        }

        return response;
    }

    private getCachedData(): (CachedData & { repoInfo?: RepositoryInfo }) | null {
        if (typeof window === 'undefined') return null;

        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (!cached) return null;

            const data = JSON.parse(cached);

            if (Date.now() > data.expiresAt) {
                localStorage.removeItem(CACHE_KEY);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error reading cache:', error);
            localStorage.removeItem(CACHE_KEY);
            return null;
        }
    }

    private setCachedData(files: BuildYamlFile[], repoInfo?: RepositoryInfo): void {
        if (typeof window === 'undefined') return;

        try {
            const now = Date.now();
            const cacheData = {
                files,
                repoInfo,
                timestamp: now,
                expiresAt: now + CACHE_DURATION,
            };

            localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        } catch (error) {
            console.error('Error setting cache:', error);
        }
    }

    async getRepositoryInfo(
        owner: string,
        repo: string,
        branch: string = 'main'
    ): Promise<RepositoryInfo | null> {
        try {
            const response = await this.fetchWithAuth(
                `https://api.github.com/repos/${owner}/${repo}/commits/${branch}`
            );
            const commit: GitHubCommit = await response.json();

            return {
                lastCommit: {
                    message: commit.commit.message,
                    author: commit.commit.author.name,
                    date: commit.commit.author.date,
                    sha: commit.sha,
                    htmlUrl: commit.html_url,
                }
            };
        } catch (error) {
            console.error('Error fetching repository info:', error);
            return null;
        }
    }

    async findBuildYamlFiles(
        owner: string,
        repo: string,
        branch: string = 'main'
    ): Promise<{ files: BuildYamlFile[]; repoInfo?: RepositoryInfo }> {
        const cachedData = this.getCachedData();
        if (cachedData) {
            console.log('Using cached GitHub data');
            return {
                files: cachedData.files,
                repoInfo: cachedData.repoInfo
            };
        }

        console.log('Fetching fresh data from GitHub API');

        try {
            // Get repository info and file tree in parallel
            const [repoInfoPromise, branchResponse] = await Promise.all([
                this.getRepositoryInfo(owner, repo, branch),
                this.fetchWithAuth(
                    `https://api.github.com/repos/${owner}/${repo}/branches/${branch}`
                )
            ]);

            const branchData: GitHubBranchResponse = await branchResponse.json();
            const commitSha = branchData.commit.sha;

            const treeResponse = await this.fetchWithAuth(
                `https://api.github.com/repos/${owner}/${repo}/git/trees/${commitSha}?recursive=1`
            );
            const treeData: GitHubTreeResponse = await treeResponse.json();

            const buildYamlFiles: BuildYamlFile[] = treeData.tree
                .filter(
                    (item): item is GitHubTreeItem =>
                        item.type === 'blob' && item.path.endsWith('/build.yaml')
                )
                .map((item) => ({
                    path: item.path,
                    sha: item.sha,
                    url: item.url,
                    htmlUrl: `https://github.com/${owner}/${repo}/blob/${branch}/${item.path}`,
                    downloadUrl: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${item.path}`,
                }));

            const repoInfo = await repoInfoPromise;
            this.setCachedData(buildYamlFiles, repoInfo || undefined);

            return { files: buildYamlFiles, repoInfo: repoInfo || undefined };
        } catch (error) {
            console.error('Error fetching GitHub data:', error);

            const expiredCache = this.getCachedData();
            if (expiredCache) {
                console.log('Using expired cache as fallback');
                return {
                    files: expiredCache.files,
                    repoInfo: expiredCache.repoInfo
                };
            }

            throw error;
        }
    }

    clearCache(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(CACHE_KEY);
        }
    }

    getCacheInfo(): { isValid: boolean; expiresAt: Date | null } {
        const cached = this.getCachedData();
        return {
            isValid: cached !== null,
            expiresAt: cached ? new Date(cached.expiresAt) : null,
        };
    }
}

export const githubService = new GitHubService();
export type { GitHubCommit, RepositoryInfo };