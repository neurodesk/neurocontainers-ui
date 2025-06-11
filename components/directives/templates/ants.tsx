import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { registerNeuroDockerTemplate } from "../template";

registerNeuroDockerTemplate({
    metadata: {
        key: "ants",
        label: "ANTs",
        description: "Advanced Normalization Tools",
        icon: DocumentDuplicateIcon,
        color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
        iconColor: "text-purple-600",
        defaultValue: {
            template: {
                name: "ants",
            }
        },
        keywords: ["ants", "normalization", "registration", "segmentation"],
        component: undefined!, // Will be set by registerNeuroDockerTemplate
    },
    name: "ants",
    url: "http://stnava.github.io/ANTs/",
    description: "Advanced Normalization Tools for computational morphometry, image registration and segmentation",
    binaries: {
        arguments: [
            {
                name: "version",
                type: "dropdown",
                required: true,
                options: ["2.4.3", "2.4.2", "2.4.1", "2.3.4", "2.3.2", "2.3.1", "2.3.0", "2.2.0", "2.1.0", "2.0.3", "2.0.0"],
                description: "ANTs version to install"
            },
            {
                name: "install_path",
                type: "text",
                required: false,
                defaultValue: "/opt/ants-{{ self.version }}",
                description: "Path where ANTs will be installed",
                advanced: true
            }
        ]
    },
    source: {
        arguments: [
            {
                name: "version",
                type: "text",
                required: true,
                description: "ANTs version to build from source"
            },
            {
                name: "repo",
                type: "text",
                required: false,
                defaultValue: "https://github.com/ANTsX/ANTs.git",
                description: "Repository URL",
                advanced: true
            },
            {
                name: "install_path",
                type: "text",
                required: false,
                defaultValue: "/opt/ants-{{ self.version }}",
                description: "Path where ANTs will be installed",
                advanced: true
            },
            {
                name: "cmake_opts",
                type: "text",
                required: false,
                defaultValue: "-DCMAKE_INSTALL_PREFIX={{ self.install_path }} -DBUILD_SHARED_LIBS=ON -DBUILD_TESTING=OFF",
                description: "CMake options",
                advanced: true
            },
            {
                name: "make_opts",
                type: "text",
                required: false,
                defaultValue: "-j1",
                description: "Make options",
                advanced: true
            }
        ]
    }
});