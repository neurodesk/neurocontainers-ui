import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { registerNeuroDockerTemplate } from "../template";

registerNeuroDockerTemplate({
    metadata: {
        key: "bids_validator",
        label: "BIDS Validator",
        description: "Brain Imaging Data Structure validator",
        icon: DocumentDuplicateIcon,
        color: { light: "bg-green-50 border-green-200 hover:bg-green-100", dark: "bg-green-900 border-green-700 hover:bg-green-800" },
        iconColor: { light: "text-green-600", dark: "text-green-400" },
        defaultValue: {
            template: {
                name: "bids_validator",
            }
        },
        keywords: ["bids", "validator", "data", "structure"],
        component: undefined!, // Will be set by registerNeuroDockerTemplate
    },
    name: "bids_validator",
    url: "https://github.com/bids-standard/bids-validator",
    description: "Validator for the Brain Imaging Data Structure (BIDS) specification",
    binaries: {
        arguments: [
            {
                name: "version",
                type: "dropdown",
                required: true,
                options: ["1.13.0", "1.12.0", "1.11.0", "1.10.0", "1.9.0"],
                description: "BIDS Validator version to install"
            },
            {
                name: "node_version",
                type: "text",
                required: false,
                defaultValue: "20",
                description: "Node.js version to install",
                advanced: true
            }
        ]
    }
});