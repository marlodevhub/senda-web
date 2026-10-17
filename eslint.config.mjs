import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // senda-web/CLAUDE.md §4: dirección única app/ → features/ → compartidos, y una feature no importa de otra.
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
        {
          target: "./src/features/access",
          from: "./src/features",
          except: ["./access"],
          message: "Una feature no importa de otra: sube lo común a src/components, src/lib o src/types, o compón en app/.",
        },
        {
          target: "./src/features/admin",
          from: "./src/features",
          except: ["./admin"],
          message: "Una feature no importa de otra: sube lo común a src/components, src/lib o src/types, o compón en app/.",
        },
        {
          target: "./src/features/analysis",
          from: "./src/features",
          except: ["./analysis"],
          message: "Una feature no importa de otra: sube lo común a src/components, src/lib o src/types, o compón en app/.",
        },
        {
          target: "./src/features/appearance",
          from: "./src/features",
          except: ["./appearance"],
          message: "Una feature no importa de otra: sube lo común a src/components, src/lib o src/types, o compón en app/.",
        },
        {
          target: "./src/features/guidance",
          from: "./src/features",
          except: ["./guidance"],
          message: "Una feature no importa de otra: sube lo común a src/components, src/lib o src/types, o compón en app/.",
        },
        {
          target: "./src/features/home",
          from: "./src/features",
          except: ["./home"],
          message: "Una feature no importa de otra: sube lo común a src/components, src/lib o src/types, o compón en app/.",
        },
        {
          target: "./src/features/journal",
          from: "./src/features",
          except: ["./journal"],
          message: "Una feature no importa de otra: sube lo común a src/components, src/lib o src/types, o compón en app/.",
        },
        {
          target: "./src/features/profile",
          from: "./src/features",
          except: ["./profile"],
          message: "Una feature no importa de otra: sube lo común a src/components, src/lib o src/types, o compón en app/.",
        },
        {
          target: "./src/features/progress",
          from: "./src/features",
          except: ["./progress"],
          message: "Una feature no importa de otra: sube lo común a src/components, src/lib o src/types, o compón en app/.",
        },
        {
          target: "./src/features/rewrite",
          from: "./src/features",
          except: ["./rewrite"],
          message: "Una feature no importa de otra: sube lo común a src/components, src/lib o src/types, o compón en app/.",
        },
        {
          target: "./src/features/welcome",
          from: "./src/features",
          except: ["./welcome"],
          message: "Una feature no importa de otra: sube lo común a src/components, src/lib o src/types, o compón en app/.",
        },
            {
              target: ["./src/components", "./src/lib", "./src/hooks", "./src/types", "./src/config"],
              from: ["./src/features", "./src/app"],
              message: "Lo compartido no depende de features ni de app/ (dirección única).",
            },
            {
              target: "./src/features",
              from: "./src/app",
              message: "Una feature no importa de app/: app/ compone features, no al revés.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
