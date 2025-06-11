// Import all directive components to trigger their registration
import "./environment";
import "./install";
import "./group";
import "./workdir";
import "./runCommand";
import "./variable";
import "./template";
import "./deploy";
import "./user";
import "./copy";
import "./file";
import "./test";
import "./include";

// Import all template components to trigger their registration  
import "./templates";

// Re-export the registry functions for external use
export { getAllDirectives, getDirective, getDirectiveRegistry } from "./registry";