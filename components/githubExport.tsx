import { ExclamationCircleIcon, PencilIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useRef, useState, useEffect } from "react";
import { ContainerRecipe, NEUROCONTAINERS_REPO } from "./common";
import { useGitHubFiles } from '@/lib/useGithub';

// GitHub modal component
export default function GitHubModal({
    isOpen,
    onClose,
    yamlData,
    yamlText
}: {
    isOpen: boolean;
    onClose: () => void;
    yamlData: ContainerRecipe | null;
    yamlText: string;
}) {
    const modalRef = useRef(null);
    const [clipboardContent, setClipboardContent] = useState("");
    const [isCopied, setIsCopied] = useState(false);
    
    // Check if container exists in repo
    const { files } = useGitHubFiles('neurodesk', 'neurocontainers', 'main');
    const containerExists = yamlData ? files.some(file => 
        file.path === `recipes/${yamlData.name}/build.yaml`
    ) : false;

    // Escape YAML content for GitHub issue body
    const escapeForMarkdown = (text: string) => {
        // Escape backticks that could break the code block
        // Also escape any other markdown that might interfere
        return text
            .replace(/```/g, '\\`\\`\\`')
            .replace(/`([^`])/g, '\\`$1')  // Escape standalone backticks
            .replace(/([^`])`/g, '$1\\`'); // Escape trailing backticks
    };

    // GitHub issues have URL length limits, so we need to handle large YAML content
    const issueBodyWithYaml = yamlData ? `### ${containerExists ? 'Update' : 'Add'} Container Request

**Container Name:** ${yamlData.name}
**Version:** ${yamlData.version || 'latest'}

This is an automated contribution request to ${containerExists ? 'update' : 'add'} the container recipe.

\`\`\`yaml
${escapeForMarkdown(yamlText)}
\`\`\`

---
*This issue was generated automatically by the Neurocontainers Builder UI*` : '';

    const isContentTooLarge = new Blob([issueBodyWithYaml]).size > 6 * 1024; // 6KB threshold

    useEffect(() => {
        if (isContentTooLarge && yamlData) {
            setClipboardContent(yamlText);
        }
    }, [isContentTooLarge, yamlText, yamlData]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(clipboardContent).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    const handleCreateIssue = (isUpdate: boolean = false) => {
        if (!yamlData) return;

        const action = isUpdate ? 'Update' : 'Add';
        const issueTitle = `[CONTRIBUTION] ${action} ${yamlData.name} container`;
        
        let issueBody;
        if (isContentTooLarge) {
            issueBody = `### ${action} Container Request

**Container Name:** ${yamlData.name}
**Version:** ${yamlData.version || 'latest'}

This is an automated contribution request to ${isUpdate ? 'update' : 'add'} the container recipe.

Please paste the YAML content from your clipboard below:

\`\`\`yaml
# Paste YAML content here
\`\`\`

---
*This issue was generated automatically by the Neurocontainers Builder UI*`;
        } else {
            issueBody = issueBodyWithYaml;
        }

        const targetUrl = new URL(`${NEUROCONTAINERS_REPO}/issues/new`);
        targetUrl.searchParams.append("title", issueTitle);
        targetUrl.searchParams.append("body", issueBody);

        window.open(targetUrl.toString(), "_blank", "noopener,noreferrer");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div
                ref={modalRef}
                className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6"
            >
                <h3 className="text-xl font-semibold text-[#0c0e0a] mb-4">
                    Contribute to GitHub
                </h3>

                <div className="mb-4 p-4 bg-[#f0f7e7] rounded-md flex items-start">
                    <ExclamationCircleIcon className="h-6 w-6 text-[#6aa329] mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[#1e2a16] mb-2">
                            You&apos;ll need to be logged into GitHub to complete this action.
                        </p>
                        {isContentTooLarge ? (
                            <p className="text-[#1e2a16] text-sm">
                                Your YAML content is too large to include in the URL. You&apos;ll need to copy it to your clipboard and paste it into the GitHub issue after clicking the button.
                            </p>
                        ) : (
                            <p className="text-[#1e2a16] text-sm">
                                This will create a GitHub issue with your container recipe that contributors can review and accept.
                            </p>
                        )}
                    </div>
                </div>

                {containerExists && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                        <p className="text-blue-800 text-sm">
                            <strong>Note:</strong> A container with this name already exists in the repository.
                        </p>
                    </div>
                )}

                {isContentTooLarge && (
                    <div className="mb-4">
                        <button
                            className={`w-full py-2 px-4 rounded-md ${isCopied
                                ? "bg-[#4f7b38] text-white"
                                : "bg-[#e6f1d6] text-[#4f7b38] hover:bg-[#d3e7b6]"
                                }`}
                            onClick={copyToClipboard}
                        >
                            {isCopied ? "Copied!" : "Copy YAML to Clipboard"}
                        </button>
                    </div>
                )}

                <div className="space-y-3 mb-6">
                    {containerExists ? (
                        <button
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#6aa329] text-white rounded-md hover:bg-[#4f7b38] font-medium transition-colors"
                            onClick={() => handleCreateIssue(true)}
                        >
                            <PencilIcon className="h-4 w-4" />
                            Update Existing Container
                        </button>
                    ) : (
                        <button
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#6aa329] text-white rounded-md hover:bg-[#4f7b38] font-medium transition-colors"
                            onClick={() => handleCreateIssue(false)}
                        >
                            <PlusIcon className="h-4 w-4" />
                            Add New Container
                        </button>
                    )}
                </div>

                <div className="flex justify-end">
                    <button
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}