import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { useRef, useState, useEffect } from "react";
import { ContainerRecipe, NEUROCONTAINERS_REPO } from "./common";

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

    const yamlSize = new Blob([yamlText]).size;
    const isYamlTooLarge = yamlSize > 6 * 1024; // 6KB threshold

    useEffect(() => {
        if (isYamlTooLarge && yamlData) {
            setClipboardContent(yamlText);
        }
    }, [isYamlTooLarge, yamlText, yamlData]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(clipboardContent).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    const handleExportToGitHub = () => {
        if (!yamlData) return;

        const targetUrl = new URL(
            `${NEUROCONTAINERS_REPO}/new/main/recipes/${yamlData.name}`
        );
        targetUrl.searchParams.append("filename", `build.yaml`);

        // If YAML is too large, don't include it in the URL
        if (!isYamlTooLarge) {
            targetUrl.searchParams.append("value", yamlText);
        }

        window.open(targetUrl.toString(), "_blank", "noopener,noreferrer");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
                ref={modalRef}
                className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6"
            >
                <h3 className="text-xl font-semibold text-[#0c0e0a] mb-4">
                    Export to GitHub
                </h3>

                <div className="mb-4 p-4 bg-[#f0f7e7] rounded-md flex items-start">
                    <ExclamationCircleIcon className="h-6 w-6 text-[#6aa329] mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[#1e2a16] mb-2">
                            You&apos;ll need to be logged into GitHub to complete this action.
                        </p>
                        {isYamlTooLarge ? (
                            <p className="text-[#1e2a16] text-sm">
                                Your YAML content is too large to include in the URL. You&apos;ll
                                need to copy it to your clipboard and paste it into GitHub after
                                clicking the link.
                            </p>
                        ) : (
                            <p className="text-[#1e2a16] text-sm">
                                This will open a new GitHub page with your container recipe
                                pre-filled.
                            </p>
                        )}
                    </div>
                </div>

                {isYamlTooLarge && (
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

                <div className="flex justify-end space-x-3">
                    <button
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-[#6aa329] text-white rounded-md hover:bg-[#4f7b38]"
                        onClick={handleExportToGitHub}
                    >
                        Continue to GitHub
                    </button>
                </div>
            </div>
        </div>
    );
}