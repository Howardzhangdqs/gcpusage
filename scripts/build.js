import { writeFileSync, readFileSync } from 'bun:fs';

const buildScript = readFileSync('dist/cli.js', 'utf-8');
writeFileSync('dist/cli.js', '#!/usr/bin/env node\n//' + buildScript);