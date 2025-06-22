import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { registerNeuroDockerTemplate } from "../template";

registerNeuroDockerTemplate({
    metadata: {
        key: "niftyreg",
        label: "NiftyReg",
        description: "Medical image registration toolkit",
        icon: DocumentDuplicateIcon,
        color: { light: "bg-lime-50 border-lime-200 hover:bg-lime-100", dark: "bg-lime-900 border-lime-700 hover:bg-lime-800" },
        iconColor: { light: "text-lime-600", dark: "text-lime-400" },
        defaultValue: {
            template: {
                name: "niftyreg",
            }
        },
        keywords: ["niftyreg", "registration", "medical", "imaging"],
        component: undefined!, // Will be set by registerNeuroDockerTemplate
    },
    name: "niftyreg",
    url: "https://github.com/KCL-BMEIS/niftyreg",
    description: "Medical image registration toolkit for aligning medical images",
    source: {
        arguments: [
            {
                name: "version",
                type: "text",
                required: true,
                description: "NiftyReg version to build from source"
            },
            {
                name: "repo",
                type: "text",
                required: false,
                defaultValue: "https://github.com/KCL-BMEIS/niftyreg",
                description: "Repository URL",
                advanced: true
            },
            {
                name: "install_path",
                type: "text",
                required: false,
                defaultValue: "/opt/niftyreg-{{ self.version }}",
                description: "Path where NiftyReg will be installed",
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