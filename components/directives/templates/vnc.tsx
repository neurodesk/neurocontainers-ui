import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { registerNeuroDockerTemplate } from "../template";

registerNeuroDockerTemplate({
    metadata: {
        key: "vnc",
        label: "VNC",
        description: "VNC server setup",
        icon: DocumentDuplicateIcon,
        color: { light: "bg-stone-50 border-stone-200 hover:bg-stone-100", dark: "bg-stone-900 border-stone-700 hover:bg-stone-800" },
        iconColor: { light: "text-stone-600", dark: "text-stone-400" },
        defaultValue: {
            template: {
                name: "vnc",
            }
        },
        keywords: ["vnc", "server", "remote", "desktop"],
        component: undefined!, // Will be set by registerNeuroDockerTemplate
    },
    name: "vnc",
    url: "https://www.realvnc.com/",
    description: "Configure VNC server for remote desktop access",
    source: {
        arguments: [
            {
                name: "passwd",
                type: "text",
                required: true,
                description: "VNC password for remote access"
            }
        ]
    }
});