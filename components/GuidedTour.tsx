import React, { useState, useCallback, useEffect } from "react";
import {
    XMarkIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    RocketLaunchIcon,
    PlusCircleIcon,
} from "@heroicons/react/24/outline";
import {
    ContainerTemplate,
    TemplateField,
    GUIDED_TOUR_TEMPLATES,
    getTemplateIcon,
} from "@/components/templates/guidedTour";
import { extractRepoName } from "@/components/templates/pythonPackage";
import { ContainerRecipe, CopyrightInfo, CATEGORIES } from "@/components/common";
import { useTheme } from "@/lib/ThemeContext";
import { cn } from "@/lib/styles";
import { LicenseSection } from "@/components/ui";
import PackageTagEditor from "@/components/ui/PackageTagEditor";
import TagEditor from "@/components/ui/TagEditor";
import { HelpSection } from "@/components/ui/HelpSection";
import templateSelectionHelpMarkdown from "@/copy/help/ui/template-selection.md";
import { loadPackageDatabase } from "@/lib/packages";

interface GuidedTourProps {
    onClose: () => void;
    onComplete: (recipe: ContainerRecipe) => void;
    onPublish?: (recipe: ContainerRecipe) => void;
}

interface FormData {
    [fieldId: string]: string | string[] | object | null;
}

interface ValidationErrors {
    [fieldId: string]: string;
}

interface Package {
    name: string;
    description: string;
    version?: string;
    section?: string;
}

const GuidedTour: React.FC<GuidedTourProps> = ({
    onClose,
    onComplete,
    onPublish,
}) => {
    const { isDark } = useTheme();

    const [currentStep, setCurrentStep] = useState(0);
    const [selectedTemplate, setSelectedTemplate] =
        useState<ContainerTemplate | null>(null);
    const [formData, setFormData] = useState<FormData>({});
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
        {}
    );
    const [isGenerating, setIsGenerating] = useState(false);
    const [packageDatabase, setPackageDatabase] = useState<Package[]>([]);
    const [databaseLoaded, setDatabaseLoaded] = useState(false);
    const [isLoadingDatabase, setIsLoadingDatabase] = useState(false);


    // Load package database
    useEffect(() => {
        const loadDatabase = async () => {
            setIsLoadingDatabase(true);
            try {
                const db = await loadPackageDatabase();
                setPackageDatabase(db);
                setDatabaseLoaded(true);
            } catch (error) {
                console.error("Failed to load package database:", error);
            } finally {
                setIsLoadingDatabase(false);
            }
        };

        loadDatabase();
    }, []);

    // Auto-fill container name when GitHub URL changes (guard against infinite updates)
    useEffect(() => {
        if (!selectedTemplate) return;
        const currentUrl = String(formData.githubUrl || "");
        if (!currentUrl) return;

        const repoName = extractRepoName(currentUrl);
        const prevRefName = extractRepoName(String(formData.oldGithubUrl || ""));

        const shouldRespectUserName = !!formData.containerName && formData.containerName !== prevRefName;
        const needsNameUpdate = !shouldRespectUserName && repoName && formData.containerName !== repoName;
        const needsUrlRefUpdate = formData.oldGithubUrl !== formData.githubUrl;

        if (needsNameUpdate || needsUrlRefUpdate) {
            setFormData((prev) => ({
                ...prev,
                containerName: needsNameUpdate ? repoName : prev.containerName,
                oldGithubUrl: formData.githubUrl || prev.oldGithubUrl,
            }));
        }
    }, [formData.githubUrl, formData.containerName, formData.oldGithubUrl, selectedTemplate]);

    const resetTour = useCallback(() => {
        setCurrentStep(0);
        setSelectedTemplate(null);
        setFormData({});
        setValidationErrors({});
        setIsGenerating(false);
    }, []);

    const handleClose = useCallback(() => {
        resetTour();
        onClose();
    }, [resetTour, onClose]);

    // Handle escape key
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleClose]);

    const validateField = useCallback(
        (
            field: TemplateField,
            value: string | string[] | object | null
        ): string | null => {
            if (field.required) {
                if (
                    (field.type === "packages" || field.type === "python-packages" || field.type === "categories" || field.type === "string-list") &&
                    (!value || (Array.isArray(value) && value.length === 0))
                ) {
                    return `${field.label} is required`;
                } else if (field.type === "license" && !value) {
                    return `${field.label} is required`;
                } else if (
                    (field.type === "text" ||
                        field.type === "url" ||
                        field.type === "textarea") &&
                    !String(value).trim()
                ) {
                    return `${field.label} is required`;
                }
            }
            if (field.validation && String(value).trim()) {
                return field.validation(String(value).trim());
            }
            return null;
        },
        []
    );

    const validateCurrentStep = useCallback((): boolean => {
        if (!selectedTemplate) return false;

        const errors: ValidationErrors = {};
        let isValid = true;

        selectedTemplate.fields.forEach((field) => {
            const value = formData[field.id] || "";
            const error = validateField(field, value);
            if (error) {
                errors[field.id] = error;
                isValid = false;
            }
        });

        setValidationErrors(errors);
        return isValid;
    }, [selectedTemplate, formData, validateField]);

    const handleNext = useCallback(() => {
        if (currentStep === 0 && selectedTemplate) {
            setCurrentStep(1);
        } else if (currentStep === 1 && validateCurrentStep()) {
            setCurrentStep(2);
        }
    }, [currentStep, selectedTemplate, validateCurrentStep]);

    const handleBack = useCallback(() => {
        setCurrentStep(Math.max(0, currentStep - 1));
        setValidationErrors({});
    }, [currentStep]);

    const handleTemplateSelect = useCallback((template: ContainerTemplate) => {
        setSelectedTemplate(template);

        // Initialize form data with default values
        const initialData: FormData = {};
        template.fields.forEach((field) => {
            if (field.type === "select" && field.options && field.options.length > 0) {
                initialData[field.id] = field.options[0].value;
            } else if (field.type === "packages" || field.type === "python-packages" || field.type === "categories" || field.type === "string-list") {
                initialData[field.id] = [];
            } else if (field.type === "license") {
                initialData[field.id] = null;
            } else {
                initialData[field.id] = "";
            }
        });
        setFormData(initialData);
        setValidationErrors({});
    }, []);

    const handleFieldChange = useCallback(
        (fieldId: string, value: string | string[] | object | null) => {
            setFormData((prev) => ({ ...prev, [fieldId]: value }));

            // Clear validation error for this field
            if (validationErrors[fieldId]) {
                setValidationErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors[fieldId];
                    return newErrors;
                });
            }
        },
        [validationErrors]
    );

    const handleGenerate = useCallback(
        async (shouldPublish = false) => {
            if (!selectedTemplate || !validateCurrentStep()) return;

            setIsGenerating(true);
            try {
                const recipe = selectedTemplate.generateRecipe(formData);

                if (shouldPublish && onPublish) {
                    onPublish(recipe);
                } else {
                    onComplete(recipe);
                }
                handleClose();
            } catch (error) {
                console.error("Failed to generate recipe:", error);
                alert(
                    "Failed to generate container recipe. Please check your inputs."
                );
            } finally {
                setIsGenerating(false);
            }
        },
        [
            selectedTemplate,
            formData,
            validateCurrentStep,
            onComplete,
            onPublish,
            handleClose,
        ]
    );

    const renderField = useCallback(
        (field: TemplateField) => {
            const value = formData[field.id];
            const error = validationErrors[field.id];

            const fieldClass = cn(
                "w-full px-3 py-2 border rounded-md text-sm transition-colors focus:outline-none focus:ring-2",
                error
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-green-500",
                isDark ? "bg-white/5 text-white" : "bg-white text-gray-900"
            );

            const selectClass = cn(
                "w-full px-3 py-2 border rounded-md text-sm transition-colors focus:outline-none focus:ring-2",
                error
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-green-500",
                isDark ? "bg-white/5 text-white" : "bg-white text-gray-900"
            );

            return (
                <div
                    key={field.id}
                    className={cn(
                        "p-4 rounded-lg shadow-sm",
                        isDark ? "bg-white/5" : "bg-white/90",
                        field.id === "githubUrl" ? "col-span-2" : ""
                    )}
                >
                    <label
                        className={cn(
                            "block text-sm font-medium mb-1",
                            isDark ? "text-gray-200" : "text-gray-800"
                        )}
                    >
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {field.description && (
                        <p
                            className={cn(
                                "text-xs mb-2",
                                isDark ? "text-gray-400" : "text-gray-600"
                            )}
                        >
                            {field.description}
                        </p>
                    )}
                    {field.type === "license" ? (
                        <LicenseSection
                            licenses={
                                value &&
                                    typeof value === "object" &&
                                    ("license" in value || "name" in value)
                                    ? [value as CopyrightInfo]
                                    : []
                            }
                            onChange={(licenses) =>
                                handleFieldChange(field.id, licenses[0] || null)
                            }
                            showAddButton={false}
                            renderAddButton={() => null}
                        />
                    ) : field.type === "packages" ? (
                        <PackageTagEditor
                            packages={Array.isArray(value) ? value : []}
                            onChange={(packages) => handleFieldChange(field.id, packages)}
                            packageDatabase={packageDatabase}
                            databaseLoaded={databaseLoaded}
                            isLoadingDatabase={isLoadingDatabase}
                            baseImage="ubuntu:24.04"
                        />
                    ) : field.type === "python-packages" ? (
                        <TagEditor
                            tags={Array.isArray(value) ? value : []}
                            onChange={(tags) => handleFieldChange(field.id, tags)}
                            placeholder={field.placeholder}
                            emptyMessage={`No ${field.packageType === 'conda' ? 'conda' : 'Python'} packages added yet`}
                            suggestions={field.packageType === 'python' ? 
                                ['numpy', 'pandas', 'matplotlib', 'scipy', 'scikit-learn', 'jupyter', 'requests', 'flask', 'seaborn', 'plotly'] :
                                field.packageType === 'conda' ? 
                                ['numpy', 'pandas', 'matplotlib', 'scipy', 'scikit-learn', 'jupyter', 'nodejs', 'seaborn', 'plotly', 'opencv'] :
                                []
                            }
                            onSuggestionClick={(suggestion) => {
                                // This callback is fired after addTag() has already been called
                                // We can add any additional behavior here if needed
                                console.log(`Added suggested package: ${suggestion}`);
                            }}
                        />
                    ) : field.type === "categories" ? (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                                {Object.entries(CATEGORIES).map(([category, { description, color }]) => (
                                    <label
                                        key={category}
                                        className={cn(
                                            "flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all hover:scale-[1.02]",
                                            Array.isArray(value) && value.includes(category)
                                                ? isDark
                                                    ? "bg-gradient-to-br from-[#7bb33a]/20 to-[#6aa329]/15 border-[#7bb33a]/40 shadow-md"
                                                    : "bg-gradient-to-br from-[#6aa329]/20 to-[#4f7b38]/15 border-[#6aa329]/40 shadow-md"
                                                : isDark
                                                    ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                                                    : "bg-white/50 border-gray-200 hover:bg-white/80 hover:border-gray-300"
                                        )}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={Array.isArray(value) && value.includes(category)}
                                            onChange={() => {
                                                const currentCategories = Array.isArray(value) ? value : [];
                                                if (currentCategories.includes(category)) {
                                                    handleFieldChange(field.id, currentCategories.filter(c => c !== category));
                                                } else {
                                                    handleFieldChange(field.id, [...currentCategories, category]);
                                                }
                                            }}
                                            className={cn(
                                                "h-4 w-4 rounded",
                                                isDark
                                                    ? "text-[#7bb33a] border-white/20 focus:ring-[#7bb33a] bg-white/5"
                                                    : "text-[#6aa329] border-gray-300 focus:ring-[#6aa329]"
                                            )}
                                        />
                                        <div 
                                            className="w-3 h-3 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: color }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className={cn(
                                                "text-sm font-medium truncate",
                                                isDark ? "text-white" : "text-gray-900"
                                            )}>
                                                {category}
                                            </div>
                                            <div className={cn(
                                                "text-xs truncate",
                                                isDark ? "text-gray-400" : "text-gray-600"
                                            )}>
                                                {description}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ) : field.type === "string-list" ? (
                        <TagEditor
                            tags={Array.isArray(value) ? value : []}
                            onChange={(tags) => handleFieldChange(field.id, tags)}
                            placeholder={field.placeholder}
                            emptyMessage="No items added yet"
                            suggestions={[]}
                            onSuggestionClick={() => {}}
                        />
                    ) : field.type === "select" ? (
                        <select
                            value={typeof value === "string" ? value : ""}
                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                            className={selectClass}
                        >
                            {field.options?.map((option) => (
                                <option 
                                    key={option.value} 
                                    value={option.value}
                                    className={isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"}
                                >
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    ) : field.type === "textarea" ? (
                        <textarea
                            value={typeof value === "string" ? value : ""}
                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                            placeholder={field.placeholder}
                            rows={4}
                            className={fieldClass}
                        />
                    ) : (
                        <input
                            type={field.type === "url" ? "url" : "text"}
                            value={typeof value === "string" ? value : ""}
                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                            placeholder={field.placeholder}
                            className={fieldClass}
                        />
                    )}
                    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                </div>
            );
        },
        [
            formData,
            validationErrors,
            isDark,
            handleFieldChange,
            packageDatabase,
            databaseLoaded,
            isLoadingDatabase,
        ]
    );
    // Render as a regular section within the page content
    return (
        <div
            aria-labelledby="guided-tour-title"
            className={cn(
                "relative rounded-xl border shadow-lg",
                isDark ? "bg-black/30 border-white/10" : "bg-white border-gray-200"
            )}
        >
            {/* Header */}
            <div
                className={cn(
                    "px-5 py-3 border-b flex items-center justify-between",
                    isDark ? "border-white/10" : "border-gray-200/50"
                )}
            >
                <div className="flex items-center space-x-3">
                    <RocketLaunchIcon className={cn(
                        "h-6 w-6",
                        isDark ? "text-[#91c84a]" : "text-[#6aa329]"
                    )} />
                    <h2
                        id="guided-tour-title"
                        className={cn(
                            "text-lg font-semibold",
                            isDark ? "text-white" : "text-gray-900"
                        )}
                    >
                        Create New Container
                    </h2>
                </div>
                <button
                    onClick={handleClose}
                    className={cn(
                        "p-2 rounded-md transition-colors",
                        isDark
                            ? "hover:bg-white/10 text-gray-300"
                            : "hover:bg-gray-200/50 text-gray-600"
                    )}
                >
                    <XMarkIcon className="h-5 w-5" />
                </button>
            </div>
            {/* Content */}
            <div className="px-5 py-5 space-y-5">
                {currentStep === 0 && (
                    <div className="space-y-5">
                        <HelpSection
                            markdownContent={templateSelectionHelpMarkdown}
                            sourceFilePath="copy/help/ui/template-selection.md"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {GUIDED_TOUR_TEMPLATES.map((template) => (
                                <button
                                    key={template.id}
                                    onClick={() => handleTemplateSelect(template)}
                                    className={cn(
                                        "group flex flex-col p-4 rounded-lg shadow-md transition-all hover:scale-[1.02] hover:shadow-lg text-left",
                                        selectedTemplate?.id === template.id
                                            ? isDark
                                                ? "bg-gradient-to-br from-[#7bb33a]/40 via-[#6aa329]/35 to-[#5a8f23]/30 backdrop-blur-md text-white shadow-lg ring-2 ring-[#91c84a]/50 border border-[#7bb33a]/40"
                                                : "bg-gradient-to-br from-[#6aa329]/40 via-[#5a8f23]/35 to-[#4f7b38]/30 backdrop-blur-md text-white shadow-lg ring-2 ring-[#6aa329]/50 border border-[#6aa329]/40"
                                            : isDark
                                                ? "bg-[#1f2e18]/25 backdrop-blur-sm border border-[#2d4222]/40 text-[#c4e382] hover:bg-[#1f2e18]/35 hover:border-[#2d4222]/60 hover:text-[#e8f5d0]"
                                                : "bg-white/20 backdrop-blur-sm border border-[#e6f1d6]/40 text-gray-800 hover:bg-white/30 hover:border-[#e6f1d6]/60"
                                    )}
                                >
                                    <div className="mb-2">{getTemplateIcon(template.id, cn(
                                        "h-8 w-8 transition-opacity",
                                        selectedTemplate?.id === template.id ? "opacity-90" : "opacity-60"
                                    ))}</div>
                                    <h4 className="font-medium mb-1">{template.name}</h4>
                                    <p className="text-sm opacity-80">{template.description}</p>
                                </button>
                            ))}
                        </div>
                        
                    </div>
                )}

                {currentStep === 1 && selectedTemplate && (
                    <div className="space-y-5">
                        <h3
                            className={cn(
                                "text-lg font-medium",
                                isDark ? "text-white" : "text-gray-900"
                            )}
                        >
                            Configure Your Container
                        </h3>
                        
                        {/* Show template details inline */}
                        {selectedTemplate.detailedDescription && (
                            <HelpSection
                                markdownContent={selectedTemplate.detailedDescription}
                                className="mb-4"
                                sourceFilePath={`copy/templates/${selectedTemplate.id.replace('-', '-')}.md`}
                            />
                        )}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {selectedTemplate.fields.map((field) => {
                                // GitHub URL full width
                                if (field.id === "githubUrl") {
                                    return (
                                        <div key={field.id} className="col-span-2">
                                            {renderField(field)}
                                        </div>
                                    );
                                }
                                // Container Name and Version on same row
                                if (field.id === "containerName" || field.id === "version") {
                                    return renderField(field);
                                }
                                // R Package Name on same row as R Version for R templates
                                if (selectedTemplate.id === 'r-package' && (field.id === "rPackageName" || field.id === "rVersion")) {
                                    return renderField(field);
                                }
                                // All others full width
                                return (
                                    <div key={field.id} className="col-span-2">
                                        {renderField(field)}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {currentStep === 2 && selectedTemplate && (
                    <div className="space-y-6">
                        <h3
                            className={cn(
                                "text-lg font-medium",
                                isDark ? "text-white" : "text-gray-900"
                            )}
                        >
                            Review & Create
                        </h3>
                        
                        {/* Summary */}
                        <div className={cn(
                            "p-4 rounded-lg border",
                            isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"
                        )}>
                            <h4 className={cn(
                                "font-medium mb-3",
                                isDark ? "text-white" : "text-gray-900"
                            )}>
                                Container Summary
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1">
                                    <span
                                        className={cn(
                                            "font-medium",
                                            isDark ? "text-gray-300" : "text-gray-700"
                                        )}
                                    >
                                        Name:
                                    </span>
                                    <span
                                        className={cn(
                                            "break-all",
                                            isDark ? "text-white" : "text-gray-900"
                                        )}
                                    >
                                        {String(formData.containerName || formData.name || 'Unnamed')}
                                    </span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1">
                                    <span
                                        className={cn(
                                            "font-medium",
                                            isDark ? "text-gray-300" : "text-gray-700"
                                        )}
                                    >
                                        Version:
                                    </span>
                                    <span
                                        className={cn(
                                            "break-all",
                                            isDark ? "text-white" : "text-gray-900"
                                        )}
                                    >
                                        {String(formData.version || '1.0.0')}
                                    </span>
                                </div>
                                <div>
                                    <span className={cn(
                                        "font-medium",
                                        isDark ? "text-gray-300" : "text-gray-700"
                                    )}>Template:</span>{" "}
                                    <span className={cn(
                                        isDark ? "text-white" : "text-gray-900"
                                    )}>{selectedTemplate.name}</span>
                                </div>
                                <div>
                                    <span className={cn(
                                        "font-medium",
                                        isDark ? "text-gray-300" : "text-gray-700"
                                    )}>Categories:</span>{" "}
                                    <span className={cn(
                                        isDark ? "text-white" : "text-gray-900"
                                    )}>{Array.isArray(formData.categories) && formData.categories.length > 0 
                                        ? formData.categories.join(', ') 
                                        : 'Not set'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Next Steps */}
                        <div className={cn(
                            "p-4 rounded-lg border",
                            isDark ? "bg-blue-900/20 border-blue-700/30" : "bg-blue-50 border-blue-200"
                        )}>
                            <h4 className={cn(
                                "font-medium mb-3 flex items-center gap-2",
                                isDark ? "text-blue-300" : "text-blue-800"
                            )}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                What happens next?
                            </h4>
                            <div className={cn(
                                "space-y-2 text-sm",
                                isDark ? "text-blue-200" : "text-blue-700"
                            )}>
                                <div className="flex items-start gap-2">
                                    <span className="font-medium">1.</span>
                                    <span>Your container recipe will be created and loaded into the builder</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="font-medium">2.</span>
                                    <span>You can customize build directives, add software packages, and configure deployment settings</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="font-medium">3.</span>
                                    <span>Test your container recipe and generate a Dockerfile</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="font-medium">4.</span>
                                    <span>Publish your container to the NeuroContainers repository when ready</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* Footer */}
            <div
                className={cn(
                    "px-5 py-3 border-t flex justify-between",
                    isDark ? "border-white/10" : "border-gray-200/50"
                )}
            >
                <button
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className={cn(
                        "flex items-center space-x-2 px-4 py-2 rounded-md transition-colors",
                        currentStep === 0
                            ? "text-gray-400 cursor-not-allowed"
                            : isDark
                                ? "text-gray-300 hover:bg-white/10"
                                : "text-gray-700 hover:bg-gray-200/50"
                    )}
                >
                    <ChevronLeftIcon className="h-4 w-4" />
                    <span>Back</span>
                </button>

                <div className="flex space-x-3">
                    <button
                        onClick={handleClose}
                        className={cn(
                            "px-4 py-2 rounded-md transition-colors",
                            isDark
                                ? "text-gray-300 hover:bg-white/10"
                                : "text-gray-700 hover:bg-gray-200/50"
                        )}
                    >
                        Cancel
                    </button>

                    {currentStep < 2 ? (
                        <button
                            onClick={handleNext}
                            disabled={currentStep === 0 ? !selectedTemplate : false}
                            className={cn(
                                "flex items-center space-x-2 px-4 py-2 rounded-md text-white transition-colors",
                                (currentStep === 0 ? !selectedTemplate : false)
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : isDark
                                        ? "bg-gradient-to-r from-[#7bb33a] to-[#6aa329] hover:from-[#8ccf45] hover:to-[#7bb33a]"
                                        : "bg-gradient-to-r from-[#6aa329] to-[#4f7b38] hover:from-[#7bb33a] hover:to-[#6aa329]"
                            )}
                        >
                            <span>Next</span>
                            <ChevronRightIcon className="h-4 w-4" />
                        </button>
                    ) : (
                        <button
                            onClick={() => handleGenerate(false)}
                            disabled={isGenerating}
                            className={cn(
                                "flex items-center space-x-2 px-6 py-2 rounded-md text-white transition-colors",
                                isGenerating
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : isDark
                                        ? "bg-gradient-to-r from-[#7bb33a] to-[#6aa329] hover:from-[#8ccf45] hover:to-[#7bb33a]"
                                        : "bg-gradient-to-r from-[#6aa329] to-[#4f7b38] hover:from-[#7bb33a] hover:to-[#6aa329]"
                            )}
                        >
                            {isGenerating ? (
                                <>
                                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                    <span>Creating...</span>
                                </>
                            ) : (
                                <>
                                    <PlusCircleIcon className="h-4 w-4" />
                                    <span>Create Container</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GuidedTour;
