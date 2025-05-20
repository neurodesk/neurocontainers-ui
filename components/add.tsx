import { useState } from "react";
import { Directive } from "@/components/common";

interface AddDirectiveButtonProps {
    onAddDirective: (directive: Directive) => void;
}

export default function AddDirectiveButton({ onAddDirective }: AddDirectiveButtonProps) {
    const [directiveType, setDirectiveType] = useState("");

    const addDirective = (type: string) => {
        let newDirective: Directive;

        switch (type) {
            case "group":
                newDirective = { group: [] };
                break;
            case "environment":
                newDirective = { environment: {} };
                break;
            case "install":
                newDirective = { install: "" };
                break;
            case "workdir":
                newDirective = { workdir: "" };
                break;
            case "run":
                newDirective = { run: [""] };
                break;
            case "variables":
                newDirective = { variables: {} };
                break;
            case "template":
                newDirective = { template: { name: "new-template" } };
                break;
            case "deploy":
                newDirective = { deploy: { path: [], bins: [] } };
                break;
            case "user":
                newDirective = { user: "" };
                break;
            case "copy":
                newDirective = { copy: [""] };
                break;
            case "file":
                newDirective = { file: { name: "", filename: "" } };
                break;
            case "test":
                newDirective = { test: { name: "", script: "" } };
                break;
            case "include":
                newDirective = { include: "macros/openrecon/neurodocker.yaml" };
                break;
            default:
                return;
        }

        onAddDirective(newDirective);
        setDirectiveType("");
    };

    return (
        <div className="flex">
            <select
                className="px-3 py-2 border border-[#6aa329] rounded-l-md text-[#0c0e0a] bg-white focus:outline-none focus:ring-1 focus:ring-[#6aa329]"
                value={directiveType}
                onChange={(e) => setDirectiveType(e.target.value)}
            >
                <option value="" disabled>
                    Add directive...
                </option>
                <option value="group">Group</option>
                <option value="environment">Environment</option>
                <option value="install">Install</option>
                <option value="workdir">Working Directory</option>
                <option value="run">Run Commands</option>
                <option value="variables">Variables</option>
                <option value="template">Template</option>
                <option value="deploy">Deploy</option>
                <option value="user">User</option>
                <option value="copy">Copy</option>
                <option value="file">File</option>
                <option value="test">Test</option>
                <option value="include">Include</option>
            </select>
            <button
                className="px-4 py-2 bg-[#6aa329] text-white rounded-r-md hover:bg-[#4f7b38] focus:outline-none focus:ring-2 focus:ring-[#6aa329] focus:ring-offset-2"
                onClick={() => {
                    if (directiveType) {
                        addDirective(directiveType);
                    }
                }}
            >
                Add
            </button>
        </div>
    );
}
