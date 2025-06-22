import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { registerNeuroDockerTemplate } from "../template";

registerNeuroDockerTemplate({
    metadata: {
        key: "mricron",
        label: "MRIcron",
        description: "Medical image viewer",
        icon: DocumentDuplicateIcon,
        color: { light: "bg-rose-50 border-rose-200 hover:bg-rose-100", dark: "bg-rose-900 border-rose-700 hover:bg-rose-800" },
        iconColor: { light: "text-rose-600", dark: "text-rose-400" },
        defaultValue: {
            template: {
                name: "mricron",
            }
        },
        keywords: ["mricron", "viewer", "medical", "imaging"],
        component: undefined!, // Will be set by registerNeuroDockerTemplate
    },
    name: "mricron",
    url: "https://github.com/neurolabusc/MRIcron",
    description: "Cross-platform medical image viewer and analysis tools",
    binaries: {
        arguments: [
            {
                name: "version",
                type: "dropdown",
                required: true,
                options: ["1.0.20190902", "1.0.20190410", "1.0.20181114", "1.0.20180614", "1.0.20180404", "1.0.20171220"],
                description: "MRIcron version to install"
            },
            {
                name: "install_path",
                type: "text",
                required: false,
                defaultValue: "/opt/mricron-{{ self.version }}",
                description: "Path where MRIcron will be installed",
                advanced: true
            }
        ]
    }
});