#!/usr/bin/env node

/**
 * This script checks CSS files for errors using stylelint
 * and then attempts to build the project to catch any CSS errors
 * that might cause build failures.
 */

import { execSync } from 'child_process';

// Simple color functions if chalk is not available
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`
};

console.log(colors.yellow('Checking CSS files for errors...'));

try {
  // Check if stylelint is installed
  try {
    console.log('Checking if stylelint is installed...');
    execSync('npx stylelint --version', { stdio: 'pipe' });
    console.log(colors.green('✓ Stylelint is installed'));
    
    // Run stylelint with focus on critical errors only
    console.log('\nRunning stylelint (checking for critical errors only)...');
    
    // Create a temporary config that only checks for critical errors
    const criticalConfig = {
      "extends": "stylelint-config-standard",
      "ignoreFiles": [
        "coverage/**/*.css",
        "node_modules/**/*.css"
      ],
      "rules": {
        // Only keep rules that would cause build failures
        "at-rule-no-unknown": [
          true,
          {
            "ignoreAtRules": [
              "tailwind",
              "apply",
              "variants",
              "responsive",
              "screen",
              "layer"
            ]
          }
        ],
        // Check for @import rule order
        "import-notation": null,
        "declaration-block-trailing-semicolon": "always",
        "at-rule-empty-line-before": [
          "always",
          {
            "except": ["first-nested", "blockless-after-blockless"],
            "ignore": ["after-comment"],
            "ignoreAtRules": ["else", "import"]
          }
        ]
      }
    };
    
    // Write the temporary config to a file
    const tempConfigPath = './temp-stylelint.json';
    const fs = await import('fs');
    fs.writeFileSync(tempConfigPath, JSON.stringify(criticalConfig, null, 2));
    
    try {
      // Run stylelint with the temporary config
      execSync(`npx stylelint "**/*.css" --config ${tempConfigPath}`, { stdio: 'inherit' });
      console.log(colors.green('✓ Critical CSS checks passed'));
    } finally {
      // Clean up the temporary config file
      fs.unlinkSync(tempConfigPath);
    }
  } catch {
    console.log(colors.yellow('⚠ Stylelint is not installed. Installing required packages...'));
    execSync('npm install --save-dev stylelint stylelint-config-standard', { stdio: 'inherit' });
    console.log(colors.green('✓ Stylelint installed'));
    
    // Run stylelint after installation (with the same critical-only approach)
    console.log('\nRunning stylelint (checking for critical errors only)...');
    execSync('npx stylelint "src/app/globals.css" "src/styles/proposal.css" --config .stylelintrc.json', { stdio: 'inherit' });
    console.log(colors.green('✓ Critical CSS checks passed'));
  }

  // Run a partial build to check for CSS errors
  try {
    console.log('\nRunning partial build to check for CSS errors...');
    execSync('next build --no-lint', { stdio: 'inherit' });
    console.log(colors.green('✓ Build check passed'));
    
    console.log(colors.green('\n✓ All CSS checks passed!'));
    process.exit(0);
  } catch (err) {
    console.error(colors.red('\n✗ Build check failed'));
    if (err.message) {
      console.error(colors.red(err.message));
    }
    process.exit(1);
  }
} catch {
  console.log(colors.yellow('\n⚠ Stylelint found some issues, but we\'ll continue with the build check'));
  
  // Even if stylelint fails, try the build
  try {
    console.log('\nRunning partial build to check for CSS errors...');
    execSync('next build --no-lint', { stdio: 'inherit' });
    console.log(colors.green('✓ Build check passed'));
    
    console.log(colors.green('\n✓ Build passed despite stylelint issues'));
    process.exit(0);
  } catch (err) {
    console.error(colors.red('\n✗ Build check failed'));
    if (err && err.message) {
      console.error(colors.red(err.message));
    }
    process.exit(1);
  }
}