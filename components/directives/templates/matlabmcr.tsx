import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { registerNeuroDockerTemplate } from "../template";

registerNeuroDockerTemplate({
    metadata: {
        key: "matlabmcr",
        label: "MATLAB MCR",
        description: "MATLAB Compiler Runtime",
        icon: DocumentDuplicateIcon,
        color: { light: "bg-cyan-50 border-cyan-200 hover:bg-cyan-100", dark: "bg-cyan-900 border-cyan-700 hover:bg-cyan-800" },
        iconColor: { light: "text-cyan-600", dark: "text-cyan-400" },
        defaultValue: {
            template: {
                name: "matlabmcr",
            }
        },
        keywords: ["matlab", "mcr", "runtime", "compiler"],
        component: undefined!, // Will be set by registerNeuroDockerTemplate
    },
    name: "matlabmcr",
    url: "https://www.mathworks.com/products/compiler/matlab-runtime.html",
    description: "Runtime environment that enables execution of compiled MATLAB applications",
    binaries: {
        arguments: [
            {
                name: "version",
                type: "dropdown",
                required: true,
                options: ["2023b", "2023a", "2022b", "2022a", "2021b", "2021a", "2020b", "2020a", "2019b", "2019a", "2018b", "2018a", "2017b", "2017a", "2016b", "2016a", "2015b", "2015aSP1", "2015a", "2014a", "2014b", "2013b", "2013a", "2012b", "2012a", "2010a"],
                description: "MATLAB Compiler Runtime version to install"
            },
            {
                name: "install_path",
                type: "text",
                required: false,
                defaultValue: "/opt/MCR-{{ self.version }}",
                description: "Path where MATLAB Compiler Runtime will be installed",
                advanced: true
            },
            {
                name: "curl_opts",
                type: "text",
                required: false,
                defaultValue: "",
                description: "Additional curl options",
                advanced: true
            }
        ]
    }
});