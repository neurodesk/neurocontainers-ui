import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { registerNeuroDockerTemplate } from "../template";

registerNeuroDockerTemplate({
    metadata: {
        key: "petpvc",
        label: "PETPVC",
        description: "PET Partial Volume Correction",
        icon: DocumentDuplicateIcon,
        color: { light: "bg-pink-50 border-pink-200 hover:bg-pink-100", dark: "bg-pink-900 border-pink-700 hover:bg-pink-800" },
        iconColor: { light: "text-pink-600", dark: "text-pink-400" },
        defaultValue: {
            template: {
                name: "petpvc",
            }
        },
        keywords: ["petpvc", "pet", "partial", "volume", "correction"],
        component: undefined!, // Will be set by registerNeuroDockerTemplate
    },
    name: "petpvc",
    url: "https://github.com/UCL/PETPVC",
    description: "Toolbox for partial volume correction in positron emission tomography",
    binaries: {
        arguments: [
            {
                name: "version",
                type: "dropdown",
                required: true,
                options: ["1.2.4", "1.2.2", "1.2.1", "1.2.0-b", "1.2.0-a", "1.1.0", "1.0.0"],
                description: "PETPVC version to install"
            },
            {
                name: "install_path",
                type: "text",
                required: false,
                defaultValue: "/opt/petpvc-{{ self.version }}",
                description: "Path where PETPVC will be installed",
                advanced: true
            }
        ]
    }
});