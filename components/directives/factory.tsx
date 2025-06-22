import { Directive, GroupDirective } from "@/components/common";

import CopyDirectiveComponent from "./copy";
import DeployDirectiveComponent from "./deploy";
import EnvironmentDirectiveComponent from "./environment";
import FileDirectiveComponent from "./file";
import GroupDirectiveComponent from "./group";
import InstallDirectiveComponent from "./install";
import RunCommandDirectiveComponent from "./runCommand";
import TemplateDirectiveComponent from "./template";
import UserDirectiveComponent from "./user";
import VariableDirectiveComponent from "./variable";
import WorkingDirectoryDirectiveComponent from "./workdir";
import TestDirectiveComponent from "./test";
import IncludeDirectiveComponent from "./include";
import { getDirective } from "./registry";

// Helper function to get directive metadata based on directive type
function getDirectiveMetadata(directive: Directive) {
    if ('group' in directive) return getDirective('group');
    if ('environment' in directive) return getDirective('environment');
    if ('install' in directive) return getDirective('install');
    if ('workdir' in directive) return getDirective('workdir');
    if ('run' in directive) return getDirective('run');
    if ('variables' in directive) return getDirective('variables');
    if ('template' in directive) return getDirective('template');
    if ('deploy' in directive) return getDirective('deploy');
    if ('user' in directive) return getDirective('user');
    if ('copy' in directive) return getDirective('copy');
    if ('file' in directive) return getDirective('file');
    if ('test' in directive) return getDirective('test');
    if ('include' in directive) return getDirective('include');
    return undefined;
}

export default function DirectiveComponent({ directive, baseImage, onChange }: {
    directive: Directive;
    baseImage: string;
    onChange: (directive: Directive) => void;
}) {
    // Get metadata for styling
    const metadata = getDirectiveMetadata(directive);

    // Common props for condition handling
    const conditionProps = {
        condition: directive.condition,
        onConditionChange: (condition: string | undefined) => {
            if (condition) {
                onChange({ ...directive, condition });
            } else {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { condition: _unused, ...directiveWithoutCondition } = directive as unknown as Record<string, unknown>;
                onChange(directiveWithoutCondition as unknown as Directive);
            }
        }
    };

    // Common props for styling
    const styleProps = metadata ? {
        color: metadata.color,
        headerColor: metadata.headerColor,
        iconColor: metadata.iconColor,
        icon: metadata.icon,
    } : {};

    if ('group' in directive) {
        // Check if this is a custom group that should use a special editor
        const customType = (directive as GroupDirective).custom;
        if (customType) {
            const customEditor = getDirective(customType);
            if (customEditor && customEditor.component !== GroupDirectiveComponent) {
                const CustomComponent = customEditor.component;
                return (
                    <CustomComponent
                        group={directive.group}
                        baseImage={baseImage}
                        onChange={(group: Directive[], params: Record<string, unknown>) => {
                            if (Object.keys(params).length === 0) {
                                // wipe the custom property to make it a normal group.
                                onChange({ group: directive.group });
                            } else {
                                onChange({
                                    ...directive,
                                    group,
                                    customParams: params,
                                });
                            }
                        }}
                        customParams={(directive as GroupDirective).customParams}
                        onCustomParamsChange={(customParams: Record<string, unknown>) => {
                            if (Object.keys(customParams).length === 0) {
                                // Remove custom properties when switching to advanced mode
                                onChange({ group: directive.group });
                            } else {
                                onChange({ group: directive.group, customParams });
                            }
                        }}
                    />
                );
            }
        }

        return (
            <GroupDirectiveComponent
                group={directive.group}
                baseImage={baseImage}
                onChange={(group: Directive[]) => onChange({ ...directive, group })}
                condition={directive.condition}
                onConditionChange={conditionProps.onConditionChange}
                {...styleProps}
            />
        );
    } else if ('environment' in directive) {
        return (
            <EnvironmentDirectiveComponent
                environment={directive.environment}
                onChange={(environment) => onChange({ ...directive, environment })}
                condition={directive.condition}
                onConditionChange={conditionProps.onConditionChange}
                {...styleProps}
            />
        );
    } else if ('install' in directive) {
        return (
            <InstallDirectiveComponent
                install={directive.install}
                baseImage={baseImage}
                onChange={(install) => onChange({ ...directive, install })}
                condition={directive.condition}
                onConditionChange={conditionProps.onConditionChange}
                {...styleProps}
            />
        );
    } else if ('workdir' in directive) {
        return (
            <WorkingDirectoryDirectiveComponent
                workdir={directive.workdir}
                onChange={(workdir) => onChange({ ...directive, workdir })}
                condition={directive.condition}
                onConditionChange={conditionProps.onConditionChange}
                {...styleProps}
            />
        );
    } else if ('run' in directive) {
        return (
            <RunCommandDirectiveComponent
                run={directive.run}
                onChange={(run) => onChange({ ...directive, run })}
                condition={directive.condition}
                onConditionChange={conditionProps.onConditionChange}
                {...styleProps}
            />
        );
    } else if ('variables' in directive) {
        return (
            <VariableDirectiveComponent
                variables={directive.variables}
                onChange={(variables) => onChange({ ...directive, variables })}
                condition={directive.condition}
                onConditionChange={conditionProps.onConditionChange}
                {...styleProps}
            />
        );
    } else if ('template' in directive) {
        return (
            <TemplateDirectiveComponent
                template={directive.template}
                onChange={(template) => onChange({ ...directive, template })}
                condition={directive.condition}
                onConditionChange={conditionProps.onConditionChange}
                {...styleProps}
            />
        );
    } else if ('deploy' in directive) {
        return (
            <DeployDirectiveComponent
                deploy={directive.deploy}
                onChange={(deploy) => onChange({ ...directive, deploy })}
                condition={directive.condition}
                onConditionChange={conditionProps.onConditionChange}
                {...styleProps}
            />
        );
    } else if ('user' in directive) {
        return (
            <UserDirectiveComponent
                user={directive.user}
                onChange={(user) => onChange({ ...directive, user })}
                condition={directive.condition}
                onConditionChange={conditionProps.onConditionChange}
                {...styleProps}
            />
        );
    } else if ('copy' in directive) {
        return (
            <CopyDirectiveComponent
                copy={directive.copy}
                onChange={(copy) => onChange({ ...directive, copy })}
                condition={directive.condition}
                onConditionChange={conditionProps.onConditionChange}
                {...styleProps}
            />
        );
    } else if ('file' in directive) {
        return (
            <FileDirectiveComponent
                file={directive.file}
                onChange={(file) => onChange({ ...directive, file })}
                condition={directive.condition}
                onConditionChange={conditionProps.onConditionChange}
                {...styleProps}
            />
        );
    } else if ('test' in directive) {
        return (
            <TestDirectiveComponent
                test={directive.test}
                onChange={(test) => onChange({ ...directive, test })}
                condition={directive.condition}
                onConditionChange={conditionProps.onConditionChange}
                {...styleProps}
            />
        );
    } else if ('include' in directive) {
        return <IncludeDirectiveComponent
            include={directive.include}
            onChange={(include) => onChange({ ...directive, include })}
            condition={directive.condition}
            onConditionChange={conditionProps.onConditionChange}
            {...styleProps}
        />;
    } else {
        return (
            <div className="bg-white rounded-md shadow-sm border border-red-200 mb-4 p-4 text-red-500">
                Unknown Directive: {Object.keys(directive).join(", ")}
            </div>
        );
    }
}