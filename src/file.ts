import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { last } from "./utils.js";

export type File = Readonly<{
	path: string;
	contents: string;
}>;

// TODO: In the future, we definitely shouldn't
// have entire files in memory
// TODO: Because typescript can't type errors,
// we can't allow the parser to make it's own
// error when it must throw a token as well.
// This is hideous and should be fixed asap.
export const makeError = (error: string | { message: string; offset: number; }, file: File, options?: { linesAround?: number; }) => {
	if (typeof error === "string")
		return `${error}\n  in "${file.path}".`;

	const linesAround = options?.linesAround ?? 5;
	const linesBeforeError = file.contents.slice(0, error.offset).split(/\r*\n/);
	const line = linesBeforeError.length;
	const char = last(linesBeforeError)!.length + 1;
	const context = file.contents.split(/\r*\n/).slice(line - linesAround - 1, line + linesAround);
	let pretty = "";
	const offset = (line + linesAround).toString().length + 1;
	for (let i = line - linesAround; i <= line + linesAround; i++) {
		const _line = context[i - line + linesAround];
		pretty += i.toString().padStart(offset, " ");
		pretty += " | ";
		if (_line === undefined) break;
		pretty += _line;
		pretty += "\n";
		if (i === line) pretty += `${" ".repeat(char + offset + 2)}\u001b[31m^\u001b[0m\n`;
	}
	return `${error.message}\n\tin "${file.path}"\n\tat line ${line}, char ${char}.\n\n${pretty}`.replace(/\t/g, "  ");
};

const read = (path: string, encoding: BufferEncoding = "utf-8"): File => ({
	path: join(dirname(fileURLToPath(import.meta.url)), "..", path),
	contents: readFileSync(path, { encoding })
});

export default read;