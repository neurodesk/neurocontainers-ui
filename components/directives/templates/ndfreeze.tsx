import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { registerNeuroDockerTemplate } from "../template";

registerNeuroDockerTemplate({
    metadata: {
        key: "ndfreeze",
        label: "NeuroDebian Freeze",
        description: "Freeze NeuroDebian packages to a specific date",
        icon: DocumentDuplicateIcon,
        color: { light: "bg-slate-50 border-slate-200 hover:bg-slate-100", dark: "bg-slate-900 border-slate-700 hover:bg-slate-800" },
        iconColor: { light: "text-slate-600", dark: "text-slate-400" },
        defaultValue: {
            template: {
                name: "ndfreeze",
            }
        },
        keywords: ["neurodebian", "freeze", "packages", "date"],
        component: undefined!, // Will be set by registerNeuroDockerTemplate
    },
    name: "ndfreeze",
    url: "https://neuro.debian.net/pkgs/neurodebian-freeze.html",
    description: "Freeze NeuroDebian package repository to a specific date for reproducible builds",
    source: {
        arguments: [
            {
                name: "date",
                type: "text",
                required: true,
                description: "Date to freeze NeuroDebian packages to (YYYY-MM-DD format)"
            },
            {
                name: "opts",
                type: "text",
                required: false,
                defaultValue: "",
                description: "Additional options for nd_freeze",
                advanced: true
            }
        ]
    }
});