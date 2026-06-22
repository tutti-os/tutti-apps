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

test("production Tutti app workflow publishes configured apps from a release bump", async () => {
  const workflowPath = ".github/workflows/publish-tutti-app.yml";
  const source = await readFile(workflowPath, "utf8");
  const workflow = parseWorkflow(workflowPath);
  const on = workflowTriggers(workflow);
  const publish = workflow.jobs.publish;

  assert.equal(workflow.name, "Publish Tutti App Production");
  assert.equal(workflow.permissions.contents, "write");
  assert.equal(on.push, undefined);
  assert.equal(on.workflow_dispatch.inputs.app_id.default, "all");
  assert.equal(on.workflow_dispatch.inputs.app_id.type, "choice");
  assert.deepEqual(on.workflow_dispatch.inputs.app_id.options, [
    "all",
    "daily-tech-radar",
  ]);
  assert.equal(on.workflow_dispatch.inputs.release_bump.type, "choice");
  assert.equal(on.workflow_dispatch.inputs.release_bump.default, "patch");
  assert.deepEqual(on.workflow_dispatch.inputs.release_bump.options, [
    "patch",
    "minor",
    "major",
  ]);
  assert.equal(on.workflow_dispatch.inputs.publish_catalog.type, "boolean");
  assert.equal(on.workflow_dispatch.inputs.publish_catalog.default, true);
  assert.equal(on.workflow_dispatch.inputs.catalog_only.type, "boolean");
  assert.equal(on.workflow_dispatch.inputs.catalog_only.default, false);
  assert.equal(
    publish.uses,
    "tutti-os/tutti/.github/workflows/publish-tutti-app-release.yml@main",
  );
  assert.deepEqual(
    publish.strategy.matrix.target,
    "${{ fromJson(needs.resolve.outputs.targets_json) }}",
  );
  assert.deepEqual(publish.concurrency, {
    group: "tutti-app-production-${{ matrix.target.app_id }}",
    "cancel-in-progress": false,
  });
  assert.equal(publish.with.app_id, "${{ matrix.target.app_id }}");
  assert.equal(
    publish.with.package_command,
    "${{ matrix.target.package_command }}",
  );
  assert.equal(publish.with.package_dir, "${{ matrix.target.package_dir }}");
  assert.equal(publish.with.icon_path, "${{ matrix.target.icon_path }}");
  assert.equal(
    publish.with.release_tag_prefix,
    "${{ matrix.target.release_tag_prefix }}",
  );
  assert.equal(publish.with.release_bump, "${{ inputs.release_bump }}");
  assert.equal(publish.with.create_release_tag, "${{ !inputs.catalog_only }}");
  assert.match(source, /inputs\.publish_catalog/);
  assert.match(source, /inputs\.catalog_only/);
  assert.doesNotMatch(source, /release_version/);
  assert.doesNotMatch(source, /TUTTI_APP_RELEASES_PRODUCTION_PUBLISH_CATALOG/);
  assert.match(source, /catalog_cloudfront_distribution_id/);
  assert.match(
    source,
    /resolve-tutti-publish-target\.mjs --environment production/,
  );
  assert.match(source, /TUTTI_APP_RELEASES_PRODUCTION_AWS_REGION/);
  assert.match(source, /TUTTI_APP_RELEASES_AWS_ROLE_ARN/);
});

test("staging Tutti app workflow publishes configured apps manually", async () => {
  const workflowPath = ".github/workflows/publish-tutti-app-staging.yml";
  const source = await readFile(workflowPath, "utf8");
  const workflow = parseWorkflow(workflowPath);
  const on = workflowTriggers(workflow);
  const publish = workflow.jobs.publish;

  assert.equal(workflow.name, "Publish Tutti App Staging");
  assert.equal(workflow.permissions.contents, "read");
  assert.deepEqual(on.push, { branches: ["main"] });
  assert.equal(on.workflow_dispatch.inputs.app_id.default, "all");
  assert.equal(on.workflow_dispatch.inputs.app_id.type, "choice");
  assert.deepEqual(on.workflow_dispatch.inputs.app_id.options, [
    "all",
    "daily-tech-radar",
  ]);
  assert.equal(on.workflow_dispatch.inputs.publish_catalog.type, "boolean");
  assert.equal(on.workflow_dispatch.inputs.publish_catalog.default, false);
  assert.equal(on.workflow_dispatch.inputs.catalog_only.type, "boolean");
  assert.equal(on.workflow_dispatch.inputs.catalog_only.default, false);
  assert.equal(
    publish.uses,
    "tutti-os/tutti/.github/workflows/publish-tutti-app-release.yml@main",
  );
  assert.deepEqual(
    publish.strategy.matrix.target,
    "${{ fromJson(needs.resolve.outputs.targets_json) }}",
  );
  assert.deepEqual(publish.concurrency, {
    group: "tutti-app-staging-${{ matrix.target.app_id }}",
    "cancel-in-progress": false,
  });
  assert.equal(publish.with.app_id, "${{ matrix.target.app_id }}");
  assert.equal(
    publish.with.package_command,
    "${{ matrix.target.package_command }}",
  );
  assert.equal(publish.with.package_dir, "${{ matrix.target.package_dir }}");
  assert.equal(publish.with.icon_path, "${{ matrix.target.icon_path }}");
  assert.equal(
    publish.with.release_tag_prefix,
    "${{ matrix.target.release_tag_prefix }}",
  );
  assert.equal(
    publish.with.publish_catalog,
    "${{ github.event_name == 'push' || inputs.publish_catalog }}",
  );
  assert.equal(
    publish.with.catalog_only,
    "${{ github.event_name == 'workflow_dispatch' && inputs.catalog_only }}",
  );
  assert.equal(on.workflow_dispatch.inputs.release_version, undefined);
  assert.equal(publish.with.release_version, undefined);
  assert.match(source, /catalog_cloudfront_distribution_id/);
  assert.match(
    source,
    /resolve-tutti-publish-target\.mjs --environment staging/,
  );
  assert.match(source, /TUTTI_APP_RELEASES_STAGING_AWS_REGION/);
  assert.match(source, /tutti-app-releases-staging/);
});
