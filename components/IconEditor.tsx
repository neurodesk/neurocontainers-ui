import { useState, useRef, useCallback, useEffect } from "react";
import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { cn, buttonStyles, textStyles } from "@/lib/styles";
import { useTheme } from "@/lib/ThemeContext";
import Image from "next/image";

interface IconEditorProps {
    value?: string; // Base64 encoded image
    onChange: (icon: string | undefined) => void;
    containerName: string;
    error?: string | null;
    showValidation?: boolean;
}

// Utility function to generate default icon from text
const generateDefaultIcon = (text: string): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return '';
    
    // Use a gradient background
    const gradient = ctx.createLinearGradient(0, 0, 64, 64);
    gradient.addColorStop(0, '#7bb33a');
    gradient.addColorStop(1, '#4f7b38');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    
    // Add text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Extract 1-2 letters from text
    const letters = text.trim().replace(/[^a-zA-Z0-9]/g, '').substring(0, 2).toUpperCase();
    ctx.fillText(letters, 32, 32);
    
    return canvas.toDataURL('image/png');
};

// Utility function to resize and crop image to 64x64
const resizeImageToIcon = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new globalThis.Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }
            
            // Calculate dimensions to crop to square and resize to 64x64
            const size = Math.min(img.width, img.height);
            const x = (img.width - size) / 2;
            const y = (img.height - size) / 2;
            
            // Draw cropped and resized image
            ctx.drawImage(img, x, y, size, size, 0, 0, 64, 64);
            
            const dataUrl = canvas.toDataURL('image/png');
            resolve(dataUrl);
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
    });
};

export default function IconEditor({ value, onChange, containerName, error, showValidation }: IconEditorProps) {
    const { isDark } = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    // Generate default icon when container name changes and no icon is set
    useEffect(() => {
        if (!value && containerName.trim() && containerName.trim().length >= 1) {
            const defaultIcon = generateDefaultIcon(containerName);
            onChange(defaultIcon);
        }
    }, [containerName, value, onChange]);

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
            const defaultIcon = generateDefaultIcon(containerName);
            onChange(defaultIcon);
        }
    }, [containerName, onChange]);

    const removeIcon = useCallback(() => {
        onChange(undefined);
    }, [onChange]);

    const triggerFileSelect = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <label className={textStyles(isDark, { weight: 'medium' })}>
                    Container Icon
                </label>
                {showValidation && error && (
                    <span className="text-red-500 text-sm">* {error}</span>
                )}
            </div>

            <div className="flex items-start gap-4">
                {/* Icon Preview */}
                <div className="flex-shrink-0">
                    <div className={cn(
                        "w-16 h-16 rounded-lg border-2 flex items-center justify-center",
                        isDark ? "border-gray-600 bg-gray-700" : "border-gray-300 bg-gray-50"
                    )}>
                        {value ? (
                            <Image 
                                src={value} 
                                alt="Container icon" 
                                width={64}
                                height={64}
                                className="w-full h-full rounded-lg object-cover"
                                unoptimized
                            />
                        ) : (
                            <PhotoIcon className={cn(
                                "w-8 h-8",
                                isDark ? "text-gray-400" : "text-gray-500"
                            )} />
                        )}
                    </div>
                </div>

                {/* Upload/Controls Area */}
                <div className="flex-1 space-y-3">
                    {/* Upload Area */}
                    <div
                        className={cn(
                            "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
                            dragOver ? (
                                isDark ? "border-[#7bb33a] bg-[#7bb33a]/10" : "border-[#4f7b38] bg-[#4f7b38]/10"
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
                            <div className="space-y-2">
                                <div className={cn(
                                    "animate-spin h-6 w-6 border-2 border-t-transparent rounded-full mx-auto",
                                    isDark ? "border-[#7bb33a]" : "border-[#4f7b38]"
                                )}></div>
                                <p className={textStyles(isDark, { size: 'sm', color: 'secondary' })}>
                                    Processing image...
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <PhotoIcon className={cn(
                                    "w-8 h-8 mx-auto",
                                    isDark ? "text-gray-400" : "text-gray-500"
                                )} />
                                <div className="space-y-1">
                                    <p className={textStyles(isDark, { size: 'sm', weight: 'medium' })}>
                                        {dragOver ? 'Drop image here' : 'Click to upload or drag & drop'}
                                    </p>
                                    <p className={textStyles(isDark, { size: 'xs', color: 'secondary' })}>
                                        Images will be automatically cropped and resized to 64×64 pixels
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={generateDefault}
                            className={buttonStyles(isDark, 'secondary', 'sm')}
                            disabled={!containerName.trim() || isGenerating}
                        >
                            Generate Default
                        </button>
                        
                        {value && (
                            <button
                                type="button"
                                onClick={removeIcon}
                                className={cn(
                                    buttonStyles(isDark, 'secondary', 'sm'),
                                    "text-red-500 hover:text-red-600"
                                )}
                                disabled={isGenerating}
                            >
                                <XMarkIcon className="w-4 h-4 mr-1" />
                                Remove
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Helper Text */}
            <div className={cn(
                "text-xs p-3 rounded-lg",
                isDark ? "bg-gray-800/50 text-gray-300" : "bg-gray-50 text-gray-600"
            )}>
                <p className="mb-1"><strong>Tips:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Upload any image format (PNG, JPG, GIF, etc.)</li>
                    <li>Images are automatically cropped to square and resized to 64×64 pixels</li>
                    <li>Default icons are generated using the first 1-2 letters of the container name</li>
                    <li>Icons are stored as base64 data in the YAML definition</li>
                </ul>
            </div>
        </div>
    );
}