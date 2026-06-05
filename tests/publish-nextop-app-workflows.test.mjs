import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import test from "node:test";

function parseWorkflow(path) {
  const json = execFileSync(
    "ruby",
    [
      "-ryaml",
      "-rjson",
      "-e",
      "ARGV.each { |path| puts YAML.load_file(path).to_json }",
      path,
    ],
    { encoding: "utf8" },
  );
  return JSON.parse(json);
}

function workflowTriggers(workflow) {
  return workflow.on ?? workflow.true;
}

test("production Nextop app workflow publishes configured apps on main", async () => {
  const workflowPath = ".github/workflows/publish-nextop-app.yml";
  const source = await readFile(workflowPath, "utf8");
  const workflow = parseWorkflow(workflowPath);
  const on = workflowTriggers(workflow);
  const publish = workflow.jobs.publish;

  assert.equal(workflow.name, "Publish Nextop App Production");
  assert.deepEqual(on.push.branches, ["main"]);
  assert.equal(on.workflow_dispatch.inputs.app_id.default, "github-trending");
  assert.equal(
    publish.uses,
    "nextop-os/nextop/.github/workflows/publish-nextop-app-release.yml@main",
  );
  assert.equal(publish.with.app_id, "${{ needs.resolve.outputs.app_id }}");
  assert.equal(
    publish.with.package_command,
    "${{ needs.resolve.outputs.package_command }}",
  );
  assert.equal(
    publish.with.package_dir,
    "${{ needs.resolve.outputs.package_dir }}",
  );
  assert.equal(
    publish.with.icon_path,
    "${{ needs.resolve.outputs.icon_path }}",
  );
  assert.match(
    source,
    /resolve-nextop-publish-target\.mjs --environment production/,
  );
  assert.match(source, /NEXTOP_APP_RELEASES_PRODUCTION_AWS_REGION/);
  assert.match(source, /NEXTOP_APP_RELEASES_AWS_ROLE_ARN/);
});

test("staging Nextop app workflow publishes configured apps manually", async () => {
  const workflowPath = ".github/workflows/publish-nextop-app-staging.yml";
  const source = await readFile(workflowPath, "utf8");
  const workflow = parseWorkflow(workflowPath);
  const on = workflowTriggers(workflow);
  const publish = workflow.jobs.publish;

  assert.equal(workflow.name, "Publish Nextop App Staging");
  assert.equal(on.push, undefined);
  assert.equal(on.workflow_dispatch.inputs.app_id.default, "github-trending");
  assert.equal(
    publish.uses,
    "nextop-os/nextop/.github/workflows/publish-nextop-app-release.yml@main",
  );
  assert.equal(publish.with.app_id, "${{ needs.resolve.outputs.app_id }}");
  assert.equal(
    publish.with.package_command,
    "${{ needs.resolve.outputs.package_command }}",
  );
  assert.equal(
    publish.with.package_dir,
    "${{ needs.resolve.outputs.package_dir }}",
  );
  assert.equal(
    publish.with.icon_path,
    "${{ needs.resolve.outputs.icon_path }}",
  );
  assert.match(
    source,
    /resolve-nextop-publish-target\.mjs --environment staging/,
  );
  assert.match(source, /NEXTOP_APP_RELEASES_STAGING_AWS_REGION/);
  assert.match(source, /nextop-app-releases-staging/);
});
