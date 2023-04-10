import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        coverage: {
            provider: 'istanbul',
            reporter: ['text', 'html'],

            // Require 100% test coverage
            lines: 100,
            functions: 100,
            statements: 100,
            branches: 100,
        },
    },
});
