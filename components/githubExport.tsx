import { ExclamationCircleIcon, PencilIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useRef, useState, useEffect } from "react";
import { ContainerRecipe, NEUROCONTAINERS_REPO } from "./common";
import { useGitHubFiles } from '@/lib/useGithub';
import * as pako from "pako";
import { iconStyles, textStyles, cn, cardStyles, buttonStyles } from "@/lib/styles";
import { useTheme } from "@/lib/ThemeContext";

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
    const { isDark } = useTheme();
    const modalRef = useRef(null);
    const [clipboardContent, setClipboardContent] = useState("");
    const [isCopied, setIsCopied] = useState(false);

    // Check if container exists in repo
    const { files } = useGitHubFiles('neurodesk', 'neurocontainers', 'main');
    const containerExists = yamlData ? files.some(file =>
        file.path === `recipes/${yamlData.name}/build.yaml`
    ) : false;

    // Compress YAML content to base64 deflate
    const compressToBase64 = (text: string): string => {
        const textEncoder = new TextEncoder();
        const compressed = pako.deflate(textEncoder.encode(text));
        return Buffer.from(compressed).toString('base64');
    };

    // GitHub issues have URL length limits, so we need to handle large YAML content
    const compressedYaml = yamlText ? compressToBase64(yamlText) : '';
    const issueBodyWithYaml = yamlData ? `### ${containerExists ? 'Update' : 'Add'} Container Request

**Container Name:** ${yamlData.name}
**Version:** ${yamlData.version || 'latest'}

This is an automated contribution request to ${containerExists ? 'update' : 'add'} the container recipe.

\`\`\`base64
${compressedYaml}
\`\`\`

---
*This issue was generated automatically by the Neurocontainers Builder UI*` : '';

    const isContentTooLarge = new Blob([issueBodyWithYaml]).size > 6 * 1024; // 6KB threshold

    useEffect(() => {
        if (isContentTooLarge && yamlData) {
            setClipboardContent(compressedYaml);
        }
    }, [isContentTooLarge, compressedYaml, yamlData]);

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

Please paste the compressed YAML content from your clipboard below:

\`\`\`base64
# Paste base64 deflate compressed YAML content here
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
        <div className={cn(
            "fixed inset-0 flex items-center justify-center z-50 p-4",
            isDark ? "bg-black/90" : "bg-black/80"
        )}>
            <div
                ref={modalRef}
                className={cn(cardStyles(isDark, 'default', 'md'), "max-w-md w-full p-4 sm:p-6")}
            >
                <h3 className={cn(
                    textStyles(isDark, { size: 'xl', weight: 'semibold', color: 'primary' }),
                    "mb-4"
                )}>
                    Contribute to GitHub
                </h3>

                <div className={cn(
                    "mb-4 p-4 rounded-md flex items-start",
                    isDark ? "bg-[#1f2e18]" : "bg-[#f0f7e7]"
                )}>
                    <ExclamationCircleIcon className={cn(iconStyles(isDark, 'lg', 'secondary'), "mr-3 flex-shrink-0 mt-0.5")} />
                    <div>
                        <p className={cn(textStyles(isDark, { color: 'primary' }), "mb-2")}>
                            You&apos;ll need to be logged into GitHub to complete this action.
                        </p>
                        {isContentTooLarge ? (
                            <p className={cn(textStyles(isDark, { size: 'sm', color: 'primary' }))}>
                                Your YAML content is too large to include in the URL. You&apos;ll need to copy the compressed content to your clipboard and paste it into the GitHub issue after clicking the button.
                            </p>
                        ) : (
                            <p className={cn(textStyles(isDark, { size: 'sm', color: 'primary' }))}>
                                This will create a GitHub issue with your container recipe (base64 deflate compressed) that contributors can review and accept.
                            </p>
                        )}
                    </div>
                </div>

                {containerExists && (
                    <div className={cn(
                        "mb-4 p-3 rounded-md border",
                        isDark ? "bg-blue-900/20 border-blue-700" : "bg-blue-50 border-blue-200"
                    )}>
                        <p className={cn(
                            textStyles(isDark, { size: 'sm' }),
                            isDark ? "text-blue-400" : "text-blue-800"
                        )}>
                            <strong>Note:</strong> A container with this name already exists in the repository.
                        </p>
                    </div>
                )}

                {isContentTooLarge && (
                    <div className="mb-4">
                        <button
                            className={cn(
                                "w-full py-2 px-4 rounded-md transition-colors",
                                isCopied
                                    ? (isDark ? "bg-[#6ea232] text-white" : "bg-[#4f7b38] text-white")
                                    : (isDark
                                        ? "bg-[#2d4222] text-[#91c84a] hover:bg-[#3f5b2e]"
                                        : "bg-[#e6f1d6] text-[#4f7b38] hover:bg-[#d3e7b6]")
                            )}
                            onClick={copyToClipboard}
                        >
                            {isCopied ? "Copied!" : "Copy Compressed YAML to Clipboard"}
                        </button>
                    </div>
                )}

                <div className="space-y-3 mb-6">
                    {containerExists ? (
                        <button
                            className={cn(buttonStyles(isDark, 'primary', 'md'), "w-full justify-center gap-2 px-4 py-3")}
                            onClick={() => handleCreateIssue(true)}
                        >
                            <PencilIcon className={iconStyles(isDark, 'sm')} />
                            Update Existing Container
                        </button>
                    ) : (
                        <button
                            className={cn(buttonStyles(isDark, 'primary', 'md'), "w-full justify-center gap-2 px-4 py-3")}
                            onClick={() => handleCreateIssue(false)}
                        >
                            <PlusIcon className={iconStyles(isDark, 'sm')} />
                            Add New Container
                        </button>
                    )}
                </div>

                <div className="flex justify-end">
                    <button
                        className={buttonStyles(isDark, 'secondary', 'md')}
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}