/**
 * TypeScript definitions for Boutiques descriptors
 * Based on Boutiques schema version 0.5
 * 
 * Boutiques is a framework to make neuroimaging applications available in 
 * computing platforms, such as the CBRAIN web portal or CLOWDR cloud computing.
 * 
 * @see https://boutiques.github.io/
 * @see https://github.com/boutiques/boutiques-schema
 */

// ============================================================================
// Base Types
// ============================================================================

export type BoutiquesInputType = "String" | "File" | "Flag" | "Number";

export type BoutiquesContainerType = "docker" | "singularity" | "rootfs";

export type BoutiquesSchemaVersion = "0.5";

// ============================================================================
// Container Image Definition
// ============================================================================

interface BoutiquesContainerBase {
  "working-directory"?: string;
  "container-hash"?: string;
}

export interface BoutiquesDockerContainer extends BoutiquesContainerBase {
  type: "docker" | "singularity";
  image: string;
  entrypoint?: boolean;
  index?: string;
  "container-opts"?: string[];
}

export interface BoutiquesRootfsContainer extends BoutiquesContainerBase {
  type: "rootfs";
  url: string;
}

export type BoutiquesContainerImage = BoutiquesDockerContainer | BoutiquesRootfsContainer;

// ============================================================================
// Environment Variables
// ============================================================================

export interface BoutiquesEnvironmentVariable {
  name: string;
  value: string;
  description?: string;
}

// ============================================================================
// Input Definitions
// ============================================================================

interface BoutiquesInputBase {
  id: string;
  name: string;
  type: BoutiquesInputType;
  description?: string;
  "value-key"?: string;
  list?: boolean;
  "list-separator"?: string;
  optional?: boolean;
  "command-line-flag"?: string;
  "requires-inputs"?: string[];
  "disables-inputs"?: string[];
  "command-line-flag-separator"?: string;
  "default-value"?: string | number | boolean;
}

export interface BoutiquesStringInput extends BoutiquesInputBase {
  type: "String";
  "value-choices"?: (string | number)[];
  "value-requires"?: Record<string, string[]>;
  "value-disables"?: Record<string, string[]>;
}

export interface BoutiquesFileInput extends BoutiquesInputBase {
  type: "File";
  "value-choices"?: (string | number)[];
  "value-requires"?: Record<string, string[]>;
  "value-disables"?: Record<string, string[]>;
  "uses-absolute-path"?: boolean;
}

export interface BoutiquesNumberInput extends BoutiquesInputBase {
  type: "Number";
  "value-choices"?: (string | number)[];
  "value-requires"?: Record<string, string[]>;
  "value-disables"?: Record<string, string[]>;
  integer?: boolean;
  minimum?: number;
  maximum?: number;
  "exclusive-minimum"?: boolean;
  "exclusive-maximum"?: boolean;
  "min-list-entries"?: number;
  "max-list-entries"?: number;
}

export interface BoutiquesFlagInput extends BoutiquesInputBase {
  type: "Flag";
  list?: false; // Flags cannot be lists, but list property is optional
  "command-line-flag": string; // Required for Flag inputs
}

export type BoutiquesInput = 
  | BoutiquesStringInput 
  | BoutiquesFileInput 
  | BoutiquesNumberInput 
  | BoutiquesFlagInput;

// ============================================================================
// Input Groups
// ============================================================================

export interface BoutiquesInputGroup {
  id: string;
  name: string;
  description?: string;
  members: string[];
  "mutually-exclusive"?: boolean;
  "one-is-required"?: boolean;
  "all-or-none"?: boolean;
}

// ============================================================================
// Output Files
// ============================================================================

export interface BoutiquesConditionalPathTemplate {
  [condition: string]: string;
}

export interface BoutiquesOutputFile {
  id: string;
  name: string;
  description?: string;
  "value-key"?: string;
  "path-template"?: string;
  "conditional-path-template"?: BoutiquesConditionalPathTemplate[];
  "path-template-stripped-extensions"?: string[];
  list?: boolean;
  optional?: boolean;
  "command-line-flag"?: string;
  "command-line-flag-separator"?: string;
  "uses-absolute-path"?: boolean;
  "file-template"?: string[];
}

// ============================================================================
// Test Definitions
// ============================================================================

export interface BoutiquesTestAssertion {
  "exit-code"?: number;
  "output-files"?: {
    id: string;
    "md5-reference"?: string;
  }[];
}

export interface BoutiquesTest {
  name: string;
  invocation: Record<string, unknown>;
  assertions: BoutiquesTestAssertion;
}

// ============================================================================
// Error Codes
// ============================================================================

export interface BoutiquesErrorCode {
  code: number;
  description: string;
}

// ============================================================================
// Resource Suggestions
// ============================================================================

export interface BoutiquesSuggestedResources {
  "cpu-cores"?: number;
  ram?: number;
  "disk-space"?: number;
  nodes?: number;
  "walltime-estimate"?: number;
}

// ============================================================================
// Tags
// ============================================================================

export interface BoutiquesTags {
  [key: string]: string | string[] | boolean;
}

// ============================================================================
// Main Boutiques Descriptor
// ============================================================================

export interface BoutiquesDescriptor {
  // Required fields
  name: string;
  description: string;
  "tool-version": string;
  "schema-version": BoutiquesSchemaVersion;
  "command-line": string;
  inputs: BoutiquesInput[];

  // Optional metadata fields
  "deprecated-by-doi"?: string | boolean;
  author?: string;
  url?: string;
  "descriptor-url"?: string;
  doi?: string;
  "tool-doi"?: string;
  shell?: string;

  // Container configuration
  "container-image"?: BoutiquesContainerImage;

  // Environment setup
  "environment-variables"?: BoutiquesEnvironmentVariable[];

  // Input organization
  groups?: BoutiquesInputGroup[];

  // Output specification
  "output-files"?: BoutiquesOutputFile[];

  // Testing
  tests?: BoutiquesTest[];

  // Platform integration
  "online-platform-urls"?: string[];

  // Execution configuration
  "invocation-schema"?: Record<string, unknown>;
  "suggested-resources"?: BoutiquesSuggestedResources;
  tags?: BoutiquesTags;
  "error-codes"?: BoutiquesErrorCode[];
  custom?: Record<string, unknown>;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Type guard to check if an input is a Flag input
 */
export function isFlagInput(input: BoutiquesInput): input is BoutiquesFlagInput {
  return input.type === "Flag";
}

/**
 * Type guard to check if an input is a Number input
 */
export function isNumberInput(input: BoutiquesInput): input is BoutiquesNumberInput {
  return input.type === "Number";
}

/**
 * Type guard to check if an input is a File input
 */
export function isFileInput(input: BoutiquesInput): input is BoutiquesFileInput {
  return input.type === "File";
}

/**
 * Type guard to check if an input is a String input
 */
export function isStringInput(input: BoutiquesInput): input is BoutiquesStringInput {
  return input.type === "String";
}

/**
 * Type guard to check if a container is a Docker/Singularity container
 */
export function isDockerContainer(container: BoutiquesContainerImage): container is BoutiquesDockerContainer {
  return container.type === "docker" || container.type === "singularity";
}

/**
 * Type guard to check if a container is a Rootfs container
 */
export function isRootfsContainer(container: BoutiquesContainerImage): container is BoutiquesRootfsContainer {
  return container.type === "rootfs";
}

// ============================================================================
// Helper Types for Working with Boutiques Data
// ============================================================================

/**
 * Extract input IDs from a Boutiques descriptor
 */
export type BoutiquesInputIds<T extends BoutiquesDescriptor> = T["inputs"][number]["id"];

/**
 * Extract output IDs from a Boutiques descriptor
 */
export type BoutiquesOutputIds<T extends BoutiquesDescriptor> = 
  T["output-files"] extends readonly BoutiquesOutputFile[] 
    ? T["output-files"][number]["id"] 
    : never;

/**
 * Extract group IDs from a Boutiques descriptor
 */
export type BoutiquesGroupIds<T extends BoutiquesDescriptor> = 
  T["groups"] extends readonly BoutiquesInputGroup[] 
    ? T["groups"][number]["id"] 
    : never;

/**
 * A validated Boutiques descriptor that has been parsed and validated
 */
export interface ValidatedBoutiquesDescriptor extends BoutiquesDescriptor {
  _validated: true;
  _validatedAt: Date;
}

// ============================================================================
// Export Default Type
// ============================================================================

export default BoutiquesDescriptor;