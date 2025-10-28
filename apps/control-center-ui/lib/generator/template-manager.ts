/**
 * Template Manager
 * 
 * Loads and compiles project templates based on project type.
 * Templates are Handlebars files stored in lib/generator/templates/
 */

import * as path from 'path';
import * as fs from 'fs/promises';
import Handlebars from 'handlebars';
import { FileToGenerate } from './file-generator';

// =============================================================================
// Types
// =============================================================================

export type ProjectType = 
  | 'nextjs-app'
  | 'react-spa'
  | 'terraform-infra'
  | 'python-api'
  | 'azure-function'
  | 'nodejs-microservice';

export interface ProjectTemplate {
  files: Array<{
    path: string;
    templatePath?: string; // Path to .hbs template file
    content?: string; // Direct content (if not from template file)
  }>;
}

// =============================================================================
// Template Definitions
// =============================================================================

/**
 * Get basic file structure for each project type
 * Returns files with either template paths or direct content
 */
export function getProjectTemplate(projectType: ProjectType): ProjectTemplate {
  const templates: Record<ProjectType, ProjectTemplate> = {
    'nextjs-app': {
      files: [
        { path: 'package.json', templatePath: 'nextjs-app/package.json.hbs' },
        { path: 'README.md', templatePath: 'nextjs-app/README.md.hbs' },
        { path: 'tsconfig.json', content: getNextjsTsConfig() },
        { path: 'next.config.js', content: getNextConfig() },
        { path: '.gitignore', content: getNextjsGitignore() },
        { path: '.eslintrc.json', content: getNextjsEslint() },
        { path: 'app/page.tsx', content: getNextjsHomePage() },
        { path: 'app/layout.tsx', content: getNextjsRootLayout() },
        { path: 'app/globals.css', content: getGlobalStyles() },
      ],
    },
    'react-spa': {
      files: [
        { path: 'package.json', content: getReactPackageJson() },
        { path: 'README.md', content: getReactReadme() },
        { path: 'tsconfig.json', content: getReactTsConfig() },
        { path: 'vite.config.ts', content: getViteConfig() },
        { path: '.gitignore', content: getReactGitignore() },
        { path: 'index.html', content: getIndexHtml() },
        { path: 'src/main.tsx', content: getReactMain() },
        { path: 'src/App.tsx', content: getReactApp() },
        { path: 'src/App.css', content: getAppStyles() },
      ],
    },
    'terraform-infra': {
      files: [
        { path: 'README.md', content: getTerraformReadme() },
        { path: '.gitignore', content: getTerraformGitignore() },
        { path: 'main.tf', content: getTerraformMain() },
        { path: 'variables.tf', content: getTerraformVariables() },
        { path: 'outputs.tf', content: getTerraformOutputs() },
        { path: 'providers.tf', content: getTerraformProviders() },
        { path: 'terraform.tfvars.example', content: getTerraformTfvarsExample() },
      ],
    },
    'python-api': {
      files: [
        { path: 'README.md', content: getPythonApiReadme() },
        { path: '.gitignore', content: getPythonGitignore() },
        { path: 'requirements.txt', content: getPythonRequirements() },
        { path: 'main.py', content: getPythonMain() },
        { path: 'app/__init__.py', content: '' },
        { path: 'app/api.py', content: getPythonApi() },
        { path: 'app/models.py', content: getPythonModels() },
      ],
    },
    'azure-function': {
      files: [
        { path: 'README.md', content: getAzureFunctionReadme() },
        { path: '.gitignore', content: getPythonGitignore() },
        { path: 'requirements.txt', content: getAzureFunctionRequirements() },
        { path: 'host.json', content: getHostJson() },
        { path: 'local.settings.json', content: getLocalSettings() },
        { path: 'function_app.py', content: getFunctionApp() },
      ],
    },
    'nodejs-microservice': {
      files: [
        { path: 'package.json', content: getNodejsPackageJson() },
        { path: 'README.md', content: getNodejsReadme() },
        { path: 'tsconfig.json', content: getNodejsTsConfig() },
        { path: '.gitignore', content: getNodejsGitignore() },
        { path: 'src/index.ts', content: getNodejsIndex() },
        { path: 'src/server.ts', content: getNodejsServer() },
        { path: 'Dockerfile', content: getDockerfile() },
      ],
    },
  };
  
  return templates[projectType];
}

// =============================================================================
// Template Content Functions (inline templates)
// =============================================================================

function getNextjsTsConfig(): string {
  return `{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
`;
}

function getNextConfig(): string {
  return `/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
`;
}

function getNextjsGitignore(): string {
  return `# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts
`;
}

function getNextjsEslint(): string {
  return `{
  "extends": "next/core-web-vitals"
}
`;
}

function getNextjsHomePage(): string {
  return `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">{{projectName}}</h1>
      <p className="mt-4 text-lg text-gray-600">
        Created with DXC Cloud Mind Spec-Driven Development Platform
      </p>
    </main>
  );
}
`;
}

function getNextjsRootLayout(): string {
  return `import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '{{projectName}}',
  description: 'Generated by DXC Cloud Mind',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`;
}

function getGlobalStyles(): string {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;
`;
}

// Simplified templates for other project types (placeholder content)

function getReactPackageJson(): string {
  return `{
  "name": "{{kebabCase projectName}}",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.1",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.2.2",
    "vite": "^5.2.0"
  }
}
`;
}

function getReactReadme(): string {
  return `# {{projectName}}

A React SPA created with Vite and the DXC Cloud Mind Platform.

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`
`;
}

function getReactTsConfig(): string {
  return `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
`;
}

function getViteConfig(): string {
  return `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
`;
}

function getReactGitignore(): string {
  return `node_modules
dist
dist-ssr
*.local
.env
`;
}

function getIndexHtml(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{projectName}}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
}

function getReactMain(): string {
  return `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './App.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
`;
}

function getReactApp(): string {
  return `import './App.css';

function App() {
  return (
    <div className="App">
      <h1>{{projectName}}</h1>
      <p>Created with DXC Cloud Mind Platform</p>
    </div>
  );
}

export default App;
`;
}

function getAppStyles(): string {
  return `#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}
`;
}

// Terraform templates
function getTerraformReadme(): string {
  return `# {{projectName}}

Terraform infrastructure for Azure.

## Usage

\`\`\`bash
terraform init
terraform plan
terraform apply
\`\`\`
`;
}

function getTerraformGitignore(): string {
  return `# Terraform
.terraform/
*.tfstate
*.tfstate.*
.terraform.lock.hcl
terraform.tfvars
`;
}

function getTerraformMain(): string {
  return `# Main Terraform configuration
# Project: {{projectName}}

resource "azurerm_resource_group" "main" {
  name     = "rg-{{kebabCase projectName}}"
  location = var.location
}
`;
}

function getTerraformVariables(): string {
  return `variable "location" {
  description = "Azure region"
  type        = string
  default     = "westeurope"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}
`;
}

function getTerraformOutputs(): string {
  return `output "resource_group_name" {
  value = azurerm_resource_group.main.name
}

output "location" {
  value = azurerm_resource_group.main.location
}
`;
}

function getTerraformProviders(): string {
  return `terraform {
  required_version = ">= 1.0"
  
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}
`;
}

function getTerraformTfvarsExample(): string {
  return `# Copy this file to terraform.tfvars and fill in your values
location    = "westeurope"
environment = "dev"
`;
}

// Python API templates
function getPythonApiReadme(): string {
  return `# {{projectName}}

FastAPI REST API.

## Setup

\`\`\`bash
pip install -r requirements.txt
uvicorn main:app --reload
\`\`\`
`;
}

function getPythonGitignore(): string {
  return `__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
ENV/
.env
.venv
`;
}

function getPythonRequirements(): string {
  return `fastapi==0.109.0
uvicorn[standard]==0.27.0
pydantic==2.6.0
`;
}

function getPythonMain(): string {
  return `from fastapi import FastAPI
from app.api import router

app = FastAPI(title="{{projectName}}")

app.include_router(router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "{{projectName}} API"}
`;
}

function getPythonApi(): string {
  return `from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
def health_check():
    return {"status": "healthy"}
`;
}

function getPythonModels(): string {
  return `from pydantic import BaseModel

class Item(BaseModel):
    id: int
    name: str
    description: str | None = None
`;
}

// Azure Function templates
function getAzureFunctionReadme(): string {
  return `# {{projectName}}

Azure Function App.

## Local Development

\`\`\`bash
pip install -r requirements.txt
func start
\`\`\`
`;
}

function getAzureFunctionRequirements(): string {
  return `azure-functions==1.18.0
`;
}

function getHostJson(): string {
  return `{
  "version": "2.0",
  "logging": {
    "applicationInsights": {
      "samplingSettings": {
        "isEnabled": true,
        "maxTelemetryItemsPerSecond": 20
      }
    }
  }
}
`;
}

function getLocalSettings(): string {
  return `{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "python"
  }
}
`;
}

function getFunctionApp(): string {
  return `import azure.functions as func
import logging

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

@app.route(route="HttpTrigger")
def http_trigger(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')
    
    name = req.params.get('name')
    if not name:
        try:
            req_body = req.get_json()
        except ValueError:
            pass
        else:
            name = req_body.get('name')
    
    if name:
        return func.HttpResponse(f"Hello, {name}!")
    else:
        return func.HttpResponse(
            "Please pass a name on the query string or in the request body",
            status_code=400
        )
`;
}

// Node.js Microservice templates
function getNodejsPackageJson(): string {
  return `{
  "name": "{{kebabCase projectName}}",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "dev": "ts-node-dev src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.11.0",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.3.3"
  }
}
`;
}

function getNodejsReadme(): string {
  return `# {{projectName}}

Node.js microservice with Express.

## Development

\`\`\`bash
npm install
npm run dev
\`\`\`
`;
}

function getNodejsTsConfig(): string {
  return `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
`;
}

function getNodejsGitignore(): string {
  return `node_modules/
dist/
.env
*.log
`;
}

function getNodejsIndex(): string {
  return `import { startServer } from './server';

const PORT = process.env.PORT || 3000;

startServer(PORT);
`;
}

function getNodejsServer(): string {
  return `import express from 'express';

export function startServer(port: number | string) {
  const app = express();
  
  app.use(express.json());
  
  app.get('/', (req, res) => {
    res.json({ message: '{{projectName}}' });
  });
  
  app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
  });
  
  app.listen(port, () => {
    console.log(\`Server running on port \${port}\`);
  });
  
  return app;
}
`;
}

function getDockerfile(): string {
  return `FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
`;
}

/**
 * Load and compile templates to FileToGenerate objects
 */
export async function compileTemplates(
  projectType: ProjectType,
  variables: Record<string, any>
): Promise<FileToGenerate[]> {
  const template = getProjectTemplate(projectType);
  const files: FileToGenerate[] = [];
  
  for (const file of template.files) {
    let content: string;
    
    if (file.content) {
      // Use direct content
      content = file.content;
    } else if (file.templatePath) {
      // Load from template file
      const templatePath = path.join(
        process.cwd(),
        'lib',
        'generator',
        'templates',
        file.templatePath
      );
      try {
        content = await fs.readFile(templatePath, 'utf-8');
      } catch {
        // Fallback to empty content if template file doesn't exist
        content = '';
      }
    } else {
      content = '';
    }
    
    // Compile with Handlebars
    const compiled = Handlebars.compile(content);
    const finalContent = compiled(variables);
    
    files.push({
      path: file.path,
      content: finalContent,
      overwrite: false,
    });
  }
  
  return files;
}
