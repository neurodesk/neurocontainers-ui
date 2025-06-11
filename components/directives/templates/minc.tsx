import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { registerNeuroDockerTemplate } from "../template";

registerNeuroDockerTemplate({
    metadata: {
        key: "minc",
        label: "MINC",
        description: "Medical Image NetCDF toolkit",
        icon: DocumentDuplicateIcon,
        color: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
        iconColor: "text-emerald-600",
        defaultValue: {
            template: {
                name: "minc",
            }
        },
        keywords: ["minc", "medical", "imaging", "netcdf"],
        component: undefined!, // Will be set by registerNeuroDockerTemplate
    },
    name: "minc",
    url: "https://github.com/BIC-MNI/minc-toolkit-v2",
    description: "Medical Image NetCDF toolkit for medical image processing",
    binaries: {
        arguments: [
            {
                name: "version",
                type: "dropdown",
                required: true,
                options: ["1.9.15", "1.9.16", "1.9.17", "1.9.18"],
                description: "MINC toolkit version to install"
            },
            {
                name: "install_path",
                type: "text",
                required: false,
                defaultValue: "/opt/minc-{{ self.version }}",
                description: "Path where MINC will be installed",
                advanced: true
            }
        ]
    }
});