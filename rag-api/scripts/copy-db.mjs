import { cp, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const source = resolve('src/db/books.json');
const destination = resolve('dist/db/books.json');
await mkdir(dirname(destination), { recursive: true });
await cp(source, destination);
