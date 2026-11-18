// pnpm db:types — regenerate packages/shared/src/database.types.ts from the hosted schema.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { ROOT } from './db/migrations.mjs';
import { generatedTypes } from './db/remote.mjs';

writeFileSync(join(ROOT, 'packages', 'shared', 'src', 'database.types.ts'), generatedTypes());
console.log('packages/shared/src/database.types.ts regenerated from hosted Supabase');
