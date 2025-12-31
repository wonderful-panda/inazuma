/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-feature-to-feature',
      comment: 'Features should not import from other features',
      severity: 'error',
      from: { path: '^src/react/features/([^/]+)/' },
      to: {
        path: '^src/react/features/([^/]+)/',
        pathNot: [
          '^src/react/features/$1/',
          // Exception: home can import openRepository from repository
          '^src/react/features/repository/hooks/actions/openRepository\\.ts$'
        ]
      }
    },
    {
      name: 'no-shared-to-features',
      comment: 'Shared components cannot import from features',
      severity: 'error',
      from: { path: '^src/react/shared/' },
      to: { path: '^src/react/features/' }
    },
    {
      name: 'no-core-to-features-except-layout',
      comment: 'Core can only import features from core/layout (for MainWindow)',
      severity: 'error',
      from: {
        path: '^src/react/core/',
        pathNot: '^src/react/core/layout/'
      },
      to: { path: '^src/react/features/' }
    }
  ],
  options: {
    doNotFollow: {
      path: 'node_modules|generated'
    },
    tsConfig: {
      fileName: 'tsconfig.depcruise.json'
    },
    tsPreCompilationDeps: true,
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/[^/]+'
      }
    }
  }
};
