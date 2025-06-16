import { CodeBracketIcon } from "@heroicons/react/24/outline";
import { registerGroupEditor } from "../group";
import type { ComponentType } from "react";
import type { Directive } from "@/components/common";


registerGroupEditor("java", {
    metadata: {
        key: "java",
        label: "Java",
        description: "Install Java Development Kit (JDK)",
        icon: CodeBracketIcon,
        color: "bg-orange-50 border-orange-200 hover:bg-orange-100",
        iconColor: "text-orange-600",
        defaultValue: {
            group: [],
            custom: "java",
        },
        keywords: ["java", "jdk", "openjdk", "jre", "javac", "jar"],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component: undefined as unknown as ComponentType<any>, // Will be set by registerGroupEditor
    },
    helpContent() {
        return (
            <>
                <h3 className="font-semibold text-[#0c0e0a] mb-2">
                    Java Installation
                </h3>
                <div className="text-sm text-gray-600 space-y-2">
                    <p>
                        Installs Java Development Kit (JDK) or Java Runtime Environment (JRE) 
                        in your container. This group handles package installation and environment 
                        configuration for Java applications.
                    </p>
                    <div>
                        <strong>What this creates:</strong>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Install directive for the selected Java package</li>
                            <li>Environment variables (JAVA_HOME, PATH)</li>
                        </ul>
                    </div>
                    <div>
                        <strong>Available options:</strong>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>OpenJDK 8, 11, 17, 21 (LTS versions)</li>
                            <li>Default JRE/JDK from package manager</li>
                            <li>Choose between JDK (development) or JRE (runtime only)</li>
                            <li>Automatic JAVA_HOME and PATH configuration</li>
                        </ul>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-2">
                        <p className="text-blue-800 text-xs font-medium">
                            💡 Tip: Use OpenJDK for open-source projects. Version 17 or 21 recommended for modern applications.
                        </p>
                    </div>
                </div>
            </>
        )
    },
    arguments: [
        {
            name: "version",
            type: "dropdown",
            required: true,
            defaultValue: "17",
            description: "Java version to install",
            options: ["default", "8", "11", "17", "21"],
        },
        {
            name: "type",
            type: "dropdown",
            required: true,
            defaultValue: "jdk",
            description: "Install JDK (development) or JRE (runtime only)",
            options: ["jdk", "jre"],
        },
        {
            name: "setJavaHome",
            type: "boolean",
            required: false,
            defaultValue: true,
            description: "Set JAVA_HOME environment variable",
        },
    ],
    updateDirective({ version, type, setJavaHome }) {
        const packages: string[] = [];
        let javaHome = "";
        
        // Use standard package names that work across most distributions
        const javaVersion = version as string;
        const javaType = type as string;
        
        // Determine Java package and JAVA_HOME based on version
        if (javaVersion === "default") {
            packages.push(javaType === "jdk" ? "default-jdk" : "default-jre");
            javaHome = "/usr/lib/jvm/default-java";
        } else {
            packages.push(`openjdk-${javaVersion}-${javaType}`);
            javaHome = `/usr/lib/jvm/java-${javaVersion}-openjdk-amd64`;
        }
        
        const directives: Directive[] = [
            {
                install: packages,
            }
        ];
        
        // Set JAVA_HOME if requested
        if (setJavaHome && javaHome) {
            directives.push({
                environment: {
                    JAVA_HOME: javaHome,
                    PATH: `${javaHome}/bin:$PATH`,
                }
            });
        }
        
        return {
            group: directives,
            custom: "java",
        };
    },
})