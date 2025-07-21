import { useState, useRef, useCallback, useEffect } from "react";
import { PhotoIcon, XMarkIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { cn, buttonStyles, textStyles, iconStyles, getHelpSection } from "@/lib/styles";
import { useTheme } from "@/lib/ThemeContext";
import { CATEGORIES } from "@/components/common";
import Image from "next/image";

interface IconEditorProps {
    value?: string; // Base24 encoded image
    onChange: (icon: string | undefined) => void;
    containerName: string;
    categories?: (keyof typeof CATEGORIES)[];
    error?: string | null;
    showValidation?: boolean;
}

// Category-to-color mapping
const getCategoryColors = (categories?: (keyof typeof CATEGORIES)[]): string[] => {
    // Default color
    const defaultColor = "#7bb33a";

    if (!categories || categories.length === 0) {
        return [defaultColor];
    }

    // Get colors for all selected categories
    const validCategories = categories.filter(cat => CATEGORIES[cat]);

    if (validCategories.length === 0) {
        return [defaultColor];
    }

    return validCategories.map(cat => CATEGORIES[cat].color);
};

// Utility function to generate default icon from text
const generateDefaultIcon = (text: string, categories?: (keyof typeof CATEGORIES)[]): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 24;
    canvas.height = 24;
    const ctx = canvas.getContext('2d');

    if (!ctx) return '';

    const colors = getCategoryColors(categories);
    const centerX = 12;
    const centerY = 12;
    const radius = 20; // Large radius for segments

    // First, draw the colored background (circle or segments)
    if (colors.length === 1) {
        // Single color - use gradient
        const gradient = ctx.createLinearGradient(0, 0, 24, 24);
        gradient.addColorStop(0, colors[0]);
        // Create darker version for gradient
        const darkerColor = colors[0].replace(/^#/, '').match(/.{2}/g)?.map(hex =>
            Math.max(0, parseInt(hex, 16) - 40).toString(16).padStart(2, '0')
        ).join('') || '000000';
        gradient.addColorStop(1, '#' + darkerColor);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 24, 24);
    } else {
        // Multiple colors - create radial segments
        const anglePerSegment = (2 * Math.PI) / colors.length;

        colors.forEach((color, index) => {
            const startAngle = index * anglePerSegment - Math.PI / 2; // Start from top
            const endAngle = (index + 1) * anglePerSegment - Math.PI / 2;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();

            // Add subtle border between segments
            if (colors.length > 1) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        });
    }


    // Add text with black outline for better readability
    const letters = text.trim().replace(/[^a-zA-Z0-9]/g, '').substring(0, 2).toUpperCase();

    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw black outline
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.strokeText(letters, centerX, centerY);

    // Draw white text on top
    ctx.fillStyle = 'white';
    ctx.fillText(letters, centerX, centerY);

    return canvas.toDataURL('image/png');
};

// Utility function to resize and crop image to 24x24
const resizeImageToIcon = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new globalThis.Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 24;
            canvas.height = 24;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }

            // Calculate dimensions to crop to square and resize to 24x24
            const size = Math.min(img.width, img.height);
            const x = (img.width - size) / 2;
            const y = (img.height - size) / 2;

            // Draw cropped and resized image
            ctx.drawImage(img, x, y, size, size, 0, 0, 24, 24);

            const dataUrl = canvas.toDataURL('image/png');
            resolve(dataUrl);
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
    });
};

export default function IconEditor({ value, onChange, containerName, categories, error, showValidation }: IconEditorProps) {
    const { isDark } = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    // Generate default icon when container name or categories change and no icon is set
    useEffect(() => {
        if (!value && containerName.trim() && containerName.trim().length >= 1) {
            const defaultIcon = generateDefaultIcon(containerName, categories);
            onChange(defaultIcon);
        }
    }, [containerName, categories, value, onChange]);

    const handleFileSelect = useCallback(async (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        setIsGenerating(true);
        try {
            const iconData = await resizeImageToIcon(file);
            onChange(iconData);
        } catch (error) {
            console.error('Error processing image:', error);
            alert('Failed to process image. Please try a different file.');
        } finally {
            setIsGenerating(false);
        }
    }, [onChange]);

    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
        // Reset input value
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [handleFileSelect]);

    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragOver(false);

        const files = Array.from(event.dataTransfer.files);
        const imageFile = files.find(file => file.type.startsWith('image/'));

        if (imageFile) {
            handleFileSelect(imageFile);
        } else {
            alert('Please drop an image file');
        }
    }, [handleFileSelect]);

    const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragOver(true);
    }, []);

    const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragOver(false);
    }, []);

    const generateDefault = useCallback(() => {
        if (containerName.trim()) {
            const defaultIcon = generateDefaultIcon(containerName, categories);
            onChange(defaultIcon);
        }
    }, [containerName, categories, onChange]);

    const removeIcon = useCallback(() => {
        onChange(undefined);
    }, [onChange]);

    const triggerFileSelect = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const helpContent = (
        <>
            <h4 className={getHelpSection(isDark).title}>Container Icon</h4>
            <div className={cn(getHelpSection(isDark).text, "space-y-2")}>
                <p>Upload a custom icon to help identify your container visually:</p>
                <div>
                    <strong>Features:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Upload any image format (PNG, JPG, GIF, etc.)</li>
                        <li>Images are automatically cropped to square and resized to 24×24 pixels</li>
                        <li>Default icons are generated from the first 1-2 letters of the container name</li>
                        <li>Icons are embedded as base24 data in the YAML definition</li>
                    </ul>
                </div>
                <p className={textStyles(isDark, { size: 'xs' })}>
                    💡 <strong>Tip:</strong> Icons help users visually identify containers in lists and interfaces.
                </p>
            </div>
        </>
    );

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <label className={textStyles(isDark, { size: 'lg', weight: 'medium', color: 'primary' })}>
                    Container Icon
                </label>
                <button
                    type="button"
                    className={cn(
                        buttonStyles(isDark, 'ghost', 'sm'),
                        "p-1 transition-colors",
                        showHelp
                            ? (isDark ? 'text-[#7bb33a]' : 'text-[#6aa329]')
                            : (isDark ? 'text-[#91c84a] hover:text-[#7bb33a]' : 'text-[#4f7b38] hover:text-[#6aa329]')
                    )}
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowHelp(!showHelp);
                    }}
                    title={showHelp ? "Hide documentation" : "Show documentation"}
                >
                    <InformationCircleIcon className={iconStyles(isDark, 'sm')} />
                </button>
                {showValidation && error && (
                    <span className="text-red-500 text-xs">* {error}</span>
                )}
            </div>

            {showHelp && (
                <div className={cn(getHelpSection(isDark).container, "mb-2")}>
                    {helpContent}
                </div>
            )}

            <div className="flex items-center gap-3">
                {/* Icon Preview */}
                <div className="flex-shrink-0">
                    <div className={cn(
                        "w-12 h-12 rounded-md border flex items-center justify-center",
                        isDark ? "border-gray-600 bg-gray-700" : "border-gray-300 bg-gray-50"
                    )}>
                        {value ? (
                            <Image
                                src={value}
                                alt="Container icon"
                                width={24}
                                height={24}
                                className="w-full h-full rounded-md object-cover"
                                unoptimized
                            />
                        ) : (
                            <PhotoIcon className={cn(
                                "w-6 h-6",
                                isDark ? "text-gray-400" : "text-gray-500"
                            )} />
                        )}
                    </div>
                </div>

                {/* Compact Upload Area */}
                <div className="flex-1">
                    <div
                        className={cn(
                            "border border-dashed rounded-md p-3 text-center cursor-pointer transition-colors",
                            dragOver ? (
                                isDark ? "border-[#7bb33a] bg-[#7bb33a]/5" : "border-[#4f7b38] bg-[#4f7b38]/5"
                            ) : (
                                isDark ? "border-gray-600 hover:border-gray-500" : "border-gray-300 hover:border-gray-400"
                            ),
                            isGenerating && "pointer-events-none opacity-50"
                        )}
                        onClick={triggerFileSelect}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                        />

                        {isGenerating ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className={cn(
                                    "animate-spin h-4 w-4 border-2 border-t-transparent rounded-full",
                                    isDark ? "border-[#7bb33a]" : "border-[#4f7b38]"
                                )}></div>
                                <span className={textStyles(isDark, { size: 'xs', color: 'secondary' })}>
                                    Processing...
                                </span>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <p className={textStyles(isDark, { size: 'xs', weight: 'medium' })}>
                                    {dragOver ? 'Drop image here' : 'Click to upload or drag & drop'}
                                </p>
                                <p className={textStyles(isDark, { size: 'xs', color: 'muted' })}>
                                    Auto-resized to 24×24px
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-1">
                    <button
                        type="button"
                        onClick={generateDefault}
                        className={cn(
                            buttonStyles(isDark, 'ghost', 'sm'),
                            "text-xs px-2 py-1 whitespace-nowrap"
                        )}
                        disabled={!containerName.trim() || isGenerating}
                        title="Generate default icon from container name"
                    >
                        Generate
                    </button>

                    {value && (
                        <button
                            type="button"
                            onClick={removeIcon}
                            className={cn(
                                buttonStyles(isDark, 'ghost', 'sm'),
                                "text-xs px-2 py-1 whitespace-nowrap",
                                isDark ? "text-red-400 hover:text-red-300" : "text-red-500 hover:text-red-600"
                            )}
                            disabled={isGenerating}
                            title="Remove icon"
                        >
                            <XMarkIcon className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}