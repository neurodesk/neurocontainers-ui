import { DirectiveContainer, FormField, TagEditor } from "@/components/ui";
import { DeployInfo } from "@/components/common";

export default function DeployDirectiveComponent({
    deploy,
    onChange,
}: {
    deploy: DeployInfo;
    onChange: (deploy: DeployInfo) => void;
}) {
    const updatePaths = (paths: string[]) => {
        onChange({
            ...deploy,
            path: paths,
        });
    };

    const updateBins = (bins: string[]) => {
        onChange({
            ...deploy,
            bins: bins,
        });
    };

    const helpContent = (
        <>
            <h3 className="font-semibold text-[#0c0e0a] mb-2">
                DEPLOY Directive
            </h3>
            <div className="text-sm text-gray-600 space-y-2">
                <p>
                    The DEPLOY directive configures deployment settings for the container, including paths and binaries.
                </p>
                <div>
                    <strong>Paths:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Specify directories to include in deployment</li>
                        <li>Use absolute paths for clarity</li>
                        <li>Example: <code>/app/bin</code>, <code>/usr/local/bin</code></li>
                    </ul>
                </div>
                <div>
                    <strong>Binaries:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>List specific executable files to deploy</li>
                        <li>Binary names or full paths</li>
                        <li>Example: <code>myapp</code>, <code>processingTool</code></li>
                    </ul>
                </div>
            </div>
        </>
    );

    return (
        <DirectiveContainer title="Deploy" helpContent={helpContent}>
            <FormField 
                label="Paths"
                description="Add directories to include in deployment"
            >
                <TagEditor
                    tags={deploy.path || []}
                    onChange={updatePaths}
                    placeholder="Add a path..."
                    emptyMessage="No paths added yet"
                />
            </FormField>

            <FormField 
                label="Binaries"
                description="Add specific executable files to deploy"
            >
                <TagEditor
                    tags={deploy.bins || []}
                    onChange={updateBins}
                    placeholder="Add a binary..."
                    emptyMessage="No binaries added yet"
                />
            </FormField>
        </DirectiveContainer>
    );
}
