import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { registerNeuroDockerTemplate } from "../template";

registerNeuroDockerTemplate({
    metadata: {
        key: "dcm2niix",
        label: "dcm2niix",
        description: "DICOM to NIfTI converter",
        icon: DocumentDuplicateIcon,
        color: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100",
        iconColor: "text-indigo-600",
        defaultValue: {
            template: {
                name: "dcm2niix",
            }
        },
        keywords: ["dcm2niix", "dicom", "nifti", "conversion"],
        component: undefined!, // Will be set by registerNeuroDockerTemplate
    },
    name: "dcm2niix",
    url: "https://www.nitrc.org/plugins/mwiki/index.php/dcm2nii:MainPage",
    description: "Convert DICOM files to NIfTI format with BIDS sidecar files",
    binaries: {
        arguments: [
            {
                name: "version",
                type: "dropdown",
                required: true,
                options: ["latest", "v1.0.20201102", "v1.0.20200331", "v1.0.20190902"],
                description: "dcm2niix version to install"
            },
            {
                name: "install_path",
                type: "text",
                required: false,
                defaultValue: "/opt/dcm2niix-{{ self.version }}",
                description: "Path where dcm2niix will be installed",
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
                description: "dcm2niix version to build from source"
            },
            {
                name: "repo",
                type: "text",
                required: false,
                defaultValue: "https://github.com/rordenlab/dcm2niix",
                description: "Repository URL",
                advanced: true
            },
            {
                name: "install_path",
                type: "text",
                required: false,
                defaultValue: "/opt/dcm2niix-{{ self.version }}",
                description: "Path where dcm2niix will be installed",
                advanced: true
            },
            {
                name: "cmake_opts",
                type: "text",
                required: false,
                defaultValue: "",
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