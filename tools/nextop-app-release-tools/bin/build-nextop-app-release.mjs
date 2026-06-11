#!/usr/bin/env node
import { main } from "@nextop-os/app-release-tools/build-nextop-app-release";

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
