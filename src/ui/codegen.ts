import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
    schema: 'http://localhost:18000/graphql',
    documents: ['src/**/*.graphql'],
    generates: {
        './src/lib/api/commics/generated.ts': {
            plugins: ['typescript', 'typescript-operations', 'typed-document-node'],
            config: {
                avoidOptionals: true,
                useTypeImports: true,
            },
        },
    },
};

export default config;
