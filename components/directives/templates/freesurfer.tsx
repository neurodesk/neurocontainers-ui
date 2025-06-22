import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { registerNeuroDockerTemplate } from "../template";

registerNeuroDockerTemplate({
    metadata: {
        key: "freesurfer",
        label: "FreeSurfer",
        description: "Cortical reconstruction and analysis",
        icon: DocumentDuplicateIcon,
        color: { light: "bg-red-50 border-red-200 hover:bg-red-100", dark: "bg-red-900 border-red-700 hover:bg-red-800" },
        iconColor: { light: "text-red-600", dark: "text-red-400" },
        defaultValue: {
            template: {
                name: "freesurfer",
            }
        },
        keywords: ["freesurfer", "cortical", "reconstruction", "surface"],
        component: undefined!, // Will be set by registerNeuroDockerTemplate
    },
    name: "freesurfer",
    url: "https://surfer.nmr.mgh.harvard.edu/",
    description: "Software suite for processing and analyzing structural and functional neuroimaging data",
    binaries: {
        arguments: [
            {
                name: "version",
                type: "dropdown",
                required: true,
                options: ["7.4.1", "7.3.2", "7.3.1", "7.3.0", "7.2.0", "7.1.1", "7.1.1-min", "7.1.0", "6.0.1", "6.0.0", "6.0.0-min"],
                description: "FreeSurfer version to install"
            },
            {
                name: "install_path",
                type: "text",
                required: false,
                defaultValue: "/opt/freesurfer-{{ self.version }}",
                description: "Path where FreeSurfer will be installed",
                advanced: true
            },
            {
                name: "exclude_paths",
                type: "text",
                required: false,
                defaultValue: "average/mult-comp-cor\nlib/cuda\nlib/qt\nsubjects/V1_average\nsubjects/bert\nsubjects/cvs_avg35\nsubjects/cvs_avg35_inMNI152\nsubjects/fsaverage3\nsubjects/fsaverage4\nsubjects/fsaverage5\nsubjects/fsaverage6\nsubjects/fsaverage_sym\ntrctrain",
                description: "Paths to exclude from installation (one per line)",
                multiline: true,
                advanced: true
            }
        ]
    }
});