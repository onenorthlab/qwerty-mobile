#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn, spawnSync } = require("child_process");
const readline = require("readline");

const emulatorBinary = path.join(
  os.homedir(),
  "Library",
  "Android",
  "sdk",
  "emulator",
  "emulator",
);

function fail(message) {
  console.error(message);
  process.exit(1);
}

function getAvdList() {
  if (!fs.existsSync(emulatorBinary)) {
    fail(
      `Android emulator binary not found: ${emulatorBinary}\n` +
        "Please install Android Emulator via Android Studio SDK Manager.",
    );
  }

  const result = spawnSync(emulatorBinary, ["-list-avds"], {
    encoding: "utf8",
  });

  if (result.error) {
    fail(`Failed to list Android emulators: ${result.error.message}`);
  }

  if (result.status !== 0) {
    const stderr = (result.stderr || "").trim();
    fail(`Failed to list Android emulators.\n${stderr}`);
  }

  return (result.stdout || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function startEmulator(avdName) {
  const child = spawn(emulatorBinary, ["-avd", avdName], {
    detached: true,
    stdio: "ignore",
  });
  child.unref();
}

function askSelection(avds) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question("Choose an emulator by number: ", (answer) => {
      rl.close();
      const index = Number.parseInt(answer, 10);
      if (!Number.isInteger(index) || index < 1 || index > avds.length) {
        fail("Invalid selection.");
      }
      resolve(avds[index - 1]);
    });
  });
}

async function main() {
  const avds = getAvdList();

  if (avds.length === 0) {
    fail("No Android Virtual Devices found. Create one in Android Studio first.");
  }

  if (avds.length === 1) {
    const selected = avds[0];
    console.log(`Starting emulator: ${selected}`);
    startEmulator(selected);
    return;
  }

  console.log("Available Android emulators:");
  avds.forEach((name, idx) => {
    console.log(`${idx + 1}. ${name}`);
  });

  const selected = await askSelection(avds);
  console.log(`Starting emulator: ${selected}`);
  startEmulator(selected);
}

main().catch((error) => {
  fail(`Unexpected error: ${error.message}`);
});
