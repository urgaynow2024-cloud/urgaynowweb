import readline from "readline";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(q: string): Promise<string> {
  return new Promise((resolve) => rl.question(q, (a) => resolve(a)));
}

async function main() {
  const password = await ask("Enter admin password: ");
  rl.close();
  if (!password) {
    console.error("Password cannot be empty.");
    process.exit(1);
  }
  console.log("\nAdd this to your .env file:\n");
  console.log(`ADMIN_USERNAME="admin"`);
  console.log(`ADMIN_PASSWORD="${password}"\n`);
}

main();
