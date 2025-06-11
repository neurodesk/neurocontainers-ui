import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { registerNeuroDockerTemplate } from "../template";

registerNeuroDockerTemplate({
    metadata: {
        key: "spm12",
        label: "SPM12",
        description: "Statistical Parametric Mapping",
        icon: DocumentDuplicateIcon,
        color: "bg-sky-50 border-sky-200 hover:bg-sky-100",
        iconColor: "text-sky-600",
        defaultValue: {
            template: {
                name: "spm12",
            }
        },
        keywords: ["spm12", "statistical", "parametric", "mapping"],
        component: undefined!, // Will be set by registerNeuroDockerTemplate
    },
    name: "spm12",
    url: "https://www.fil.ion.ucl.ac.uk/spm/",
    description: "Statistical Parametric Mapping software for neuroimaging analysis",
    binaries: {
        arguments: [
            {
                name: "version",
                type: "dropdown",
                required: true,
                options: ["r7771", "r7487", "r7219", "r6914", "r6685", "r6472", "r6225"],
                description: "SPM12 version to install"
            },
            {
                name: "install_path",
                type: "text",
                required: false,
                defaultValue: "/opt/spm12-{{ self.version }}",
                description: "Path where SPM12 will be installed",
                advanced: true
            },
            {
                name: "matlab_install_path",
                type: "text",
                required: false,
                defaultValue: "/opt/matlab-compiler-runtime-2010a",
                description: "Path to MATLAB Compiler Runtime",
                advanced: true
            }
        ]
    }
});