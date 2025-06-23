import { CheckIcon, CloudIcon, ComputerDesktopIcon } from "@heroicons/react/24/outline";
import { SaveStatus } from "@/lib/containerStorage";

interface SaveIndicatorProps {
    status: SaveStatus;
    mode?: 'local' | 'remote';
}

export function SaveIndicator({ status, mode }: SaveIndicatorProps) {
    const getIcon = () => {
        switch (status) {
            case SaveStatus.Saved:
                return mode === 'local' ?
                    <ComputerDesktopIcon className="h-4 w-4 text-green-600" /> :
                    <CheckIcon className="h-4 w-4 text-green-600" />;
            case SaveStatus.Saving:
                return <CloudIcon className="h-4 w-4 text-blue-500 animate-pulse" />;
            case SaveStatus.Unsaved:
                return <div className="h-2 w-2 bg-orange-500 rounded-full" />;
        }
    };

    const getText = () => {
        switch (status) {
            case SaveStatus.Saved:
                return mode === 'local' ? "Saved to Filesystem" : "Saved Locally";
            case SaveStatus.Saving:
                return mode === 'local' ? "Saving to Filesystem..." : "Saving...";
            case SaveStatus.Unsaved:
                return mode === 'local' ? "Press Ctrl+S to save" : "Unsaved changes";
        }
    };

    const getTextColor = () => {
        switch (status) {
            case SaveStatus.Saved:
                return "text-green-600";
            case SaveStatus.Saving:
                return "text-blue-500";
            case SaveStatus.Unsaved:
                return mode === 'local' ? "text-blue-600" : "text-orange-600";
        }
    };

    return (
        <div className={`flex items-center space-x-1 text-xs ${getTextColor()}`}>
            {getIcon()}
            <span>{getText()}</span>
        </div>
    );
}