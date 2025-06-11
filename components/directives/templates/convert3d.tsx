import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { registerNeuroDockerTemplate } from "../template";

registerNeuroDockerTemplate({
    metadata: {
        key: "convert3d",
        label: "Convert3D",
        description: "Medical image conversion tool",
        icon: DocumentDuplicateIcon,
        color: "bg-teal-50 border-teal-200 hover:bg-teal-100",
        iconColor: "text-teal-600",
        defaultValue: {
            template: {
                name: "convert3d",
            }
        },
        keywords: ["convert3d", "c3d", "conversion", "medical", "imaging"],
        component: undefined!, // Will be set by registerNeuroDockerTemplate
    },
    name: "convert3d",
    url: "http://www.itksnap.org/pmwiki/pmwiki.php?n=Convert3D.Convert3D",
    description: "Command-line tool for converting 3D images between common file formats",
    binaries: {
        arguments: [
            {
                name: "version",
                type: "dropdown",
                required: true,
                options: ["nightly", "1.0.0"],
                description: "Convert3D version to install"
            },
            {
                name: "install_path",
                type: "text",
                required: false,
                defaultValue: "/opt/convert3d-{{ self.version }}",
                description: "Path where Convert3D will be installed",
                advanced: true
            }
        ]
    }
});