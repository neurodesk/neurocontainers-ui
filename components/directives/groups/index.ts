// Auto-discover and register all YAML group files in this directory
// Note: This relies on Webpack's require.context which is available in Next.js webpack build.
import { registerYamlGroup } from "@/lib/yamlGroupEditor/loader";
import { registerDirectivesLazily } from "@/components/directives/registry";

interface WebpackContext {
  (key: string): string;
  keys(): string[];
}

interface RequireWithContext {
  context: (path: string, recursive: boolean, regex: RegExp) => WebpackContext;
}

const req: WebpackContext = (require as unknown as RequireWithContext).context(
  './',
  false,
  /\.ya?ml$/
);

// Deferred: this module is evaluated inside an import cycle through loader.tsx,
// so registerYamlGroup may not be initialised yet. It runs on the first
// registry read, after all modules have loaded.
registerDirectivesLazily(() => {
  req.keys().forEach((key: string) => {
    const content = req(key) as string;
    // registerYamlGroup is async, so failures arrive as rejections, not throws.
    registerYamlGroup(content).catch((err) => {
      console.error(`Failed to register YAML group from ${key}:`, err);
    });
  });
});
