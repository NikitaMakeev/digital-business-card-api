import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';

const endpoint = 'http://localhost:3000';
let ready = false;
for (let attempt = 0; attempt < 90; attempt++) {
  try {
    if ((await fetch(`${endpoint}/health`)).ok) {
      ready = true;
      break;
    }
  } catch {
    // Restart briefly closes the listening socket.
  }
  await setTimeout(1000);
}
assert.ok(ready, 'API did not become healthy');
const response = await fetch(`${endpoint}/graphql`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query:
      '{ profile { id name skills { id name } experience { id company position } projects { id name } links { type url } } }',
  }),
});
assert.equal(response.status, 200);
const result = await response.json();
assert.equal(result.errors, undefined);
assert.equal(result.data.profile.name, 'Nikita Makeev');
assert.equal(result.data.profile.skills.length, 38);
assert.equal(result.data.profile.experience.length, 1);
assert.equal(result.data.profile.projects.length, 5);
assert.equal(result.data.profile.links.length, 5);
const landing = await fetch(`${endpoint}/graphql`, {
  headers: { Accept: 'text/html' },
});
assert.equal(landing.status, 200);
assert.match(await landing.text(), /embeddable-sandbox/);
if (process.argv[2] === 'before') {
  await writeFile('/tmp/business-card-before.json', JSON.stringify(result));
} else {
  assert.deepEqual(
    result,
    JSON.parse(await readFile('/tmp/business-card-before.json', 'utf8')),
  );
}
console.info('Docker stack verified: data, Sandbox, health, and stable IDs.');
