import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { registerNeuroDockerTemplate } from "../template";

registerNeuroDockerTemplate({
    metadata: {
        key: "fsl",
        label: "FSL",
        description: "FMRIB Software Library",
        icon: DocumentDuplicateIcon,
        color: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100",
        iconColor: "text-yellow-600",
        defaultValue: {
            template: {
                name: "fsl",
            }
        },
        keywords: ["fsl", "fmrib", "neuroimaging", "analysis"],
        component: undefined!, // Will be set by registerNeuroDockerTemplate
    },
    name: "fsl",
    url: "https://fsl.fmrib.ox.ac.uk/fsl/fslwiki/",
    description: "Comprehensive library of analysis tools for FMRI, MRI and DTI brain imaging data",
    alert: "FSL is non-free. If you are considering commercial use of FSL, please consult the relevant license(s).",
    binaries: {
        arguments: [
            {
                name: "version",
                type: "dropdown",
                required: true,
                options: ["6.0.7.16", "6.0.7.14", "6.0.7.8", "6.0.7.4", "6.0.7.1", "6.0.6.4", "6.0.6.3", "6.0.6.2", "6.0.6.1", "6.0.6", "6.0.5.2", "6.0.5.1", "6.0.5", "6.0.4", "6.0.3", "6.0.2", "6.0.1", "6.0.0", "5.0.11", "5.0.10", "5.0.9", "5.0.8"],
                description: "FSL version to install"
            },
            {
                name: "install_path",
                type: "text",
                required: false,
                defaultValue: "/opt/fsl-{{ self.version }}",
                description: "Path where FSL will be installed",
                advanced: true
            },
            {
                name: "exclude_paths",
                type: "text",
                required: false,
                defaultValue: "",
                description: "Paths to exclude from installation",
                advanced: true
            }
        ]
    }
});