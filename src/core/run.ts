import _eval from "./eval.js";
import parse, { defaultEnv } from "./odd.js";
import { log } from "./util.js";

const [target, outfile] = process.argv.slice(2);
outfile;

const compile = async (target: string) => {
  target;
  console.error(
    "Error: Compiler is not implemented yet."
  );
  process.exit(1);
};

const repl = async () => {
  process.stdin.setEncoding("utf-8");
  process.stdout.write(`Odd v0.3.5 repl\n> `);

  let env = defaultEnv;

  for await (const input of process.stdin) {
    const inputWithoutFinalNewline = input.replace(
      /\r*\n$/,
      ""
    );

    try {
      const [result, , newEnv] = _eval(
        parse(inputWithoutFinalNewline),
        env
      );
      log(result);
      env = newEnv;
    } catch (err) {
      console.error(err);
    }

    process.stdout.write("\n> ");
  }
};

if (target) {
  await compile(target);
} else {
  await repl();
}
