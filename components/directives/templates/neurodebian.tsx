import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { registerNeuroDockerTemplate } from "../template";

registerNeuroDockerTemplate({
    metadata: {
        key: "neurodebian",
        label: "NeuroDebian",
        description: "NeuroDebian repository setup",
        icon: DocumentDuplicateIcon,
        color: "bg-amber-50 border-amber-200 hover:bg-amber-100",
        iconColor: "text-amber-600",
        defaultValue: {
            template: {
                name: "neurodebian",
            }
        },
        keywords: ["neurodebian", "repository", "debian", "neuroscience"],
        component: undefined!, // Will be set by registerNeuroDockerTemplate
    },
    name: "neurodebian",
    url: "https://neuro.debian.net",
    description: "Configure NeuroDebian repository for neuroscience software packages",
    binaries: {
        arguments: [
            {
                name: "version",
                type: "dropdown",
                required: true,
                options: ["australia", "china-tsinghua", "china-scitech", "china-zhejiang", "germany-munich", "germany-magdeburg", "greece", "japan", "usa-ca", "usa-nh", "usa-tn"],
                description: "NeuroDebian mirror to use"
            },
            {
                name: "os_codename",
                type: "text",
                required: true,
                description: "OS codename (e.g., bionic, focal, jammy)"
            },
            {
                name: "full_or_libre",
                type: "dropdown",
                required: false,
                defaultValue: "full",
                options: ["full", "libre"],
                description: "Package set to use",
                advanced: true
            }
        ]
    }
});