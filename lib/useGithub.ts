// hooks/useGitHubFiles.ts
import { useState, useEffect, useCallback } from 'react';
import { githubService, type RepositoryInfo } from '@/lib/github';
import type { BuildYamlFile } from '@/types/github';

interface UseGitHubFilesResult {
    files: BuildYamlFile[];
    repoInfo?: RepositoryInfo;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    clearCache: () => void;
    cacheInfo: { isValid: boolean; expiresAt: Date | null };
}

export function useGitHubFiles(
    owner: string,
    repo: string,
    branch: string = 'main'
): UseGitHubFilesResult {
    const [files, setFiles] = useState<BuildYamlFile[]>([]);
    const [repoInfo, setRepoInfo] = useState<RepositoryInfo | undefined>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchFiles = useCallback(async () => {
        if (!owner || !repo) return;

        setLoading(true);
        setError(null);

        try {
            const result = await githubService.findBuildYamlFiles(owner, repo, branch);
            setFiles(result.files);
            setRepoInfo(result.repoInfo);
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Failed to fetch files';
            setError(errorMessage);
            console.error('Error fetching GitHub files:', err);
        } finally {
            setLoading(false);
        }
    }, [owner, repo, branch]);

    const clearCache = () => {
        githubService.clearCache();
        fetchFiles();
    };

    const cacheInfo = githubService.getCacheInfo();

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    return {
        files,
        repoInfo,
        loading,
        error,
        refetch: fetchFiles,
        clearCache,
        cacheInfo,
    };
}