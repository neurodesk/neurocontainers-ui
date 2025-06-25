import { ExclamationCircleIcon, PencilIcon, PlusIcon, ChevronDownIcon, ChevronUpIcon, DocumentTextIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { useRef, useState, useEffect } from "react";
import { ContainerRecipe, NEUROCONTAINERS_REPO } from "./common";
import { useGitHubFiles } from '@/lib/useGithub';
import * as pako from "pako";
import { iconStyles, textStyles, cn, cardStyles } from "@/lib/styles";
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
    const [showYamlPreview, setShowYamlPreview] = useState(false);
    const [copiedYaml, setCopiedYaml] = useState(false);

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
                className={cn(cardStyles(isDark, 'default', 'lg'), "max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto")}
            >
                <div className="mb-6">
                    <h3 className={cn(
                        textStyles(isDark, { size: '2xl', weight: 'bold', color: 'primary' }),
                        "mb-2"
                    )}>
                        Publish Container to GitHub
                    </h3>
                    <p className={cn(textStyles(isDark, { size: 'sm', color: 'secondary' }))}>
                        Create a contribution request for the {yamlData?.name || 'container'} recipe
                    </p>
                </div>

                {/* Container Info */}
                {yamlData && (
                    <div className={cn(
                        "mb-4 p-4 rounded-lg border",
                        isDark ? "bg-[#1a1f17] border-[#2d4222]" : "bg-[#fafff4] border-[#e6f1d6]"
                    )}>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className={cn(textStyles(isDark, { size: 'xs', weight: 'medium', color: 'secondary' }))}>Container Name</span>
                                <p className={cn(textStyles(isDark, { weight: 'semibold', color: 'primary' }))}>{yamlData.name}</p>
                            </div>
                            <div>
                                <span className={cn(textStyles(isDark, { size: 'xs', weight: 'medium', color: 'secondary' }))}>Version</span>
                                <p className={cn(textStyles(isDark, { weight: 'semibold', color: 'primary' }))}>{yamlData.version || 'latest'}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* YAML Preview */}
                <div className="mb-4">
                    <button
                        onClick={() => setShowYamlPreview(!showYamlPreview)}
                        className={cn(
                            "w-full flex items-center justify-between p-3 rounded-lg transition-colors",
                            isDark 
                                ? "bg-[#1a1f17] hover:bg-[#1f2e18] border border-[#2d4222]" 
                                : "bg-[#fafff4] hover:bg-[#f5fbef] border border-[#e6f1d6]"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <DocumentTextIcon className={iconStyles(isDark, 'sm', 'secondary')} />
                            <span className={cn(textStyles(isDark, { size: 'sm', weight: 'medium', color: 'primary' }))}>
                                Preview YAML Recipe
                            </span>
                        </div>
                        {showYamlPreview ? (
                            <ChevronUpIcon className={iconStyles(isDark, 'sm', 'secondary')} />
                        ) : (
                            <ChevronDownIcon className={iconStyles(isDark, 'sm', 'secondary')} />
                        )}
                    </button>
                    
                    {showYamlPreview && yamlText && (
                        <div className={cn(
                            "mt-2 rounded-lg border",
                            isDark ? "bg-[#0a0c08] border-[#2d4222]" : "bg-[#f8fdf2] border-[#e6f1d6]"
                        )}>
                            <div className="flex items-center justify-between px-4 py-2 border-b">
                                <span className={cn(textStyles(isDark, { size: 'xs', weight: 'medium', color: 'secondary' }))}>
                                    build.yaml
                                </span>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(yamlText);
                                        setCopiedYaml(true);
                                        setTimeout(() => setCopiedYaml(false), 2000);
                                    }}
                                    className={cn(
                                        "flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors",
                                        copiedYaml
                                            ? (isDark ? "bg-[#6ea232] text-white" : "bg-[#4f7b38] text-white")
                                            : (isDark
                                                ? "bg-[#2d4222] text-[#91c84a] hover:bg-[#3f5b2e]"
                                                : "bg-[#e6f1d6] text-[#4f7b38] hover:bg-[#d3e7b6]")
                                    )}
                                >
                                    <ClipboardDocumentIcon className="h-3 w-3" />
                                    {copiedYaml ? "Copied!" : "Copy"}
                                </button>
                            </div>
                            <pre className={cn(
                                "p-4 overflow-x-auto text-xs max-h-64",
                                isDark ? "text-gray-300" : "text-gray-700"
                            )}>
                                <code>{yamlText}</code>
                            </pre>
                        </div>
                    )}
                </div>

                {/* GitHub Login Notice */}
                <div className={cn(
                    "mb-4 p-4 rounded-lg border flex items-start gap-3",
                    isDark ? "bg-amber-900/20 border-amber-700/30" : "bg-amber-50 border-amber-200"
                )}>
                    <ExclamationCircleIcon className={cn(
                        "h-5 w-5 flex-shrink-0 mt-0.5",
                        isDark ? "text-amber-400" : "text-amber-600"
                    )} />
                    <div className="flex-1">
                        <p className={cn(
                            textStyles(isDark, { size: 'sm', weight: 'medium' }),
                            isDark ? "text-amber-400" : "text-amber-700"
                        )}>
                            GitHub Authentication Required
                        </p>
                        <p className={cn(
                            textStyles(isDark, { size: 'xs' }),
                            isDark ? "text-amber-400/80" : "text-amber-600",
                            "mt-1"
                        )}>
                            You&apos;ll need to be logged into GitHub to create an issue. The recipe will be compressed and included in the issue description.
                        </p>
                    </div>
                </div>

                {containerExists && (
                    <div className={cn(
                        "mb-4 p-4 rounded-lg border flex items-start gap-3",
                        isDark ? "bg-blue-900/20 border-blue-700/30" : "bg-blue-50 border-blue-200"
                    )}>
                        <PencilIcon className={cn(
                            "h-5 w-5 flex-shrink-0 mt-0.5",
                            isDark ? "text-blue-400" : "text-blue-600"
                        )} />
                        <div className="flex-1">
                            <p className={cn(
                                textStyles(isDark, { size: 'sm', weight: 'medium' }),
                                isDark ? "text-blue-400" : "text-blue-700"
                            )}>
                                Container Already Exists
                            </p>
                            <p className={cn(
                                textStyles(isDark, { size: 'xs' }),
                                isDark ? "text-blue-400/80" : "text-blue-600",
                                "mt-1"
                            )}>
                                A container named &quot;{yamlData?.name}&quot; already exists. You can create an update request.
                            </p>
                        </div>
                    </div>
                )}

                {isContentTooLarge && (
                    <div className="mb-4">
                        <div className={cn(
                            "mb-3 p-4 rounded-lg border flex items-start gap-3",
                            isDark ? "bg-red-900/20 border-red-700/30" : "bg-red-50 border-red-200"
                        )}>
                            <ExclamationCircleIcon className={cn(
                                "h-5 w-5 flex-shrink-0 mt-0.5",
                                isDark ? "text-red-400" : "text-red-600"
                            )} />
                            <div className="flex-1">
                                <p className={cn(
                                    textStyles(isDark, { size: 'sm', weight: 'medium' }),
                                    isDark ? "text-red-400" : "text-red-700"
                                )}>
                                    Large Recipe File
                                </p>
                                <p className={cn(
                                    textStyles(isDark, { size: 'xs' }),
                                    isDark ? "text-red-400/80" : "text-red-600",
                                    "mt-1"
                                )}>
                                    Your recipe is too large to include in the URL. Copy the compressed content below and paste it into the GitHub issue after clicking publish.
                                </p>
                            </div>
                        </div>
                        <button
                            className={cn(
                                "w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2",
                                isCopied
                                    ? (isDark ? "bg-[#6ea232] text-white" : "bg-[#4f7b38] text-white")
                                    : (isDark
                                        ? "bg-[#2d4222] text-[#91c84a] hover:bg-[#3f5b2e] border border-[#4f7b38]/30"
                                        : "bg-[#e6f1d6] text-[#4f7b38] hover:bg-[#d3e7b6] border border-[#4f7b38]/20")
                            )}
                            onClick={copyToClipboard}
                        >
                            <ClipboardDocumentIcon className="h-5 w-5" />
                            {isCopied ? "Copied to Clipboard!" : "Copy Compressed YAML"}
                        </button>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3 mb-6">
                    {containerExists ? (
                        <button
                            className={cn(
                                "w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
                                isDark
                                    ? "bg-gradient-to-r from-[#5a8f23] to-[#7bb33a] text-white hover:from-[#7bb33a] hover:to-[#91c84a] border border-[#91c84a]/30"
                                    : "bg-gradient-to-r from-[#4f7b38] to-[#6aa329] text-white hover:from-[#6aa329] hover:to-[#91c84a] border border-[#6aa329]/30"
                            )}
                            onClick={() => handleCreateIssue(true)}
                        >
                            <PencilIcon className="h-5 w-5" />
                            Update Existing Container
                        </button>
                    ) : (
                        <button
                            className={cn(
                                "w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
                                isDark
                                    ? "bg-gradient-to-r from-[#5a8f23] to-[#7bb33a] text-white hover:from-[#7bb33a] hover:to-[#91c84a] border border-[#91c84a]/30"
                                    : "bg-gradient-to-r from-[#4f7b38] to-[#6aa329] text-white hover:from-[#6aa329] hover:to-[#91c84a] border border-[#6aa329]/30"
                            )}
                            onClick={() => handleCreateIssue(false)}
                        >
                            <PlusIcon className="h-5 w-5" />
                            Publish New Container
                        </button>
                    )}
                </div>

                {/* Footer */}
                <div className={cn(
                    "flex items-center justify-between pt-4 border-t",
                    isDark ? "border-[#2d4222]" : "border-[#e6f1d6]"
                )}>
                    <p className={cn(
                        textStyles(isDark, { size: 'xs', color: 'secondary' })
                    )}>
                        This will open GitHub in a new tab
                    </p>
                    <button
                        className={cn(
                            "px-4 py-2 rounded-lg font-medium transition-colors",
                            isDark
                                ? "text-gray-400 hover:text-gray-300 hover:bg-[#1f2e18]"
                                : "text-gray-600 hover:text-gray-700 hover:bg-[#f0f7e7]"
                        )}
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}