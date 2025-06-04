export interface BuildYamlFile {
    path: string;
    sha: string;
    url: string;
    htmlUrl: string;
    downloadUrl?: string;
    commitInfo?: {
        message: string;
        author: string;
        date: string;
        sha: string;
    };
}

export interface CachedData {
    files: BuildYamlFile[];
    timestamp: number;
    expiresAt: number;
}

export interface GitHubTreeItem {
    path: string;
    mode: string;
    type: 'blob' | 'tree';
    sha: string;
    size?: number;
    url: string;
}

export interface GitHubTreeResponse {
    sha: string;
    url: string;
    tree: GitHubTreeItem[];
    truncated: boolean;
}

export interface GitHubBranchResponse {
    name: string;
    commit: {
        sha: string;
        url: string;
    };
}