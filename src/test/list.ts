import _eval from "../core/eval.js";
import parse, { defaultEnv } from "../core/odd.js";
import test from "../core/test.js";
import { equal } from "../core/util.js";

test("Empty lists", () => {
  const code = `[]`;
  const [result] = _eval(parse(code), defaultEnv);
  return equal(result, []);
});

test("Simple elements", () => {
  const code = `[1, ''a'', true]`;
  const [result] = _eval(parse(code), defaultEnv);
  return equal(result, [1, "a", true]);
});

test("Complex elements", () => {
  const code = `[a -> b, [], {x=7}, (a -> a) 1]`;
  try {
    _eval(parse(code), defaultEnv);
    return true;
  } catch (_) {
    return false;
  }
});

test("Dangling commas are ignored", () => {
  const code = `[1,]`;
  const [result] = _eval(parse(code), defaultEnv);
  return equal(result, [1]);
});

test("Destructuring", () => {
  const code = `x=[1];[...x]`;
  const [result] = _eval(parse(code), defaultEnv);
  return equal(result, [1]);
});
