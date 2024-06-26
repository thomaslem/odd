// https://hackage.haskell.org/package/parsec-3.1.15.1/docs/Text-Parsec.html#v:-60--42-

import {
  Expected,
  makeError,
  Problem,
} from "./problem.js";
import { formatBytes, log, unique } from "./util.js";

export type Parser = (input: State) => Result;

type Result = State & (Success | Failure);

type State = Readonly<{
  input: string;
  offset: number;
  cache: Record<number, Map<Parser, Result>>;
}>;

type Success = Readonly<{
  ok: true;
  value: ReadonlyArray<Tree>;
}>;

type Failure = Readonly<{
  ok: false;
  problems: ReadonlyArray<Problem>;
}>;

export type Token = Readonly<{
  type?: string | undefined;
  text: string;
  offset: number;
  size: number;
}>;

export type Tree = Branch | Token;

export type Branch = Readonly<{
  type: string;
  children: ReadonlyArray<Tree>;
  offset: number;
  size: number;
}>;

export const run =
  (parser: Parser) =>
  (input: string, offset = 0) =>
    parser({
      input,
      offset,
      cache: {},
    });

export const string =
  (string: string, type?: string): Parser =>
  state =>
    state.input.startsWith(string, state.offset)
      ? {
          ...state,
          ok: true,
          offset: state.offset + string.length,
          value: [
            {
              type,
              text: string,
              offset: state.offset,
              size: string.length,
            },
          ],
        }
      : {
          ...state,
          ok: false,
          problems: [
            {
              expected: `"${string}"`,
              at: state.offset,
            },
          ],
        };

export const pattern = (
  pattern: RegExp,
  type?: string
): Parser => {
  const compiledPattern = new RegExp(
    `^(?:${pattern.source})`,
    pattern.flags
  );
  return state => {
    const match = state.input
      .slice(state.offset)
      .match(compiledPattern)?.[0];
    return match !== undefined
      ? {
          ...state,
          ok: true,
          offset: state.offset + match.length,
          value: [
            {
              type,
              text: match,
              offset: state.offset,
              size: match.length,
            },
          ],
        }
      : {
          ...state,
          ok: false,
          problems: [
            state.input[state.offset]
              ? {
                  unexpected: `"${
                    state.input[state.offset]
                  }"`,
                  at: state.offset,
                }
              : {
                  endOfInput: true,
                  at: state.offset,
                },
          ],
        };
  };
};

export const label =
  (label: string) =>
  (parser: Parser): Parser =>
  state => {
    const result = parser(state);
    return result.ok || state.offset !== result.offset
      ? result
      : {
          ...result,
          problems: [
            ...result.problems.filter(
              problem =>
                !(problem as Expected).expected
            ),
            {
              expected: label,
              at: state.offset,
            },
          ],
        };
  };

export const pair =
  (a: Parser, b: Parser): Parser =>
  state => {
    const result = a(state);
    if (!result.ok) return result;
    const second = b(result);
    return second.ok
      ? {
          ...second,
          value: result.value.concat(second.value),
        }
      : second;
  };

export const chain =
  (parsers: ReadonlyArray<Parser>): Parser =>
  state =>
    parsers.reduce(pair)(state);

export const _try =
  (parser: Parser): Parser =>
  state => {
    const result = parser(state);
    return result.ok
      ? result
      : { ...state, value: [], ok: true };
  };

export const fail =
  (reason: string): Parser =>
  state => ({
    ...state,
    ok: false,
    problems: [
      {
        reason,
        at: state.offset,
      },
    ],
  });

export const either =
  (a: Parser, b: Parser): Parser =>
  state => {
    const result = a(state);
    if (result.ok) return result;
    const second = b(state);
    return second.ok
      ? second
      : {
          ...second,
          problems: unique(
            [result.problems]
              .concat(second.problems)
              .flat()
          ),
        };
  };

export const choice =
  (parsers: ReadonlyArray<Parser>): Parser =>
  state =>
    parsers.reduce(either)(state);

export const benchmark =
  (parser: Parser): Parser =>
  state => {
    const before = performance.now();
    const memoryBefore =
      process.memoryUsage().heapUsed;
    const result = parser(state);
    console.log(
      `Took ${(performance.now() - before).toFixed(
        2
      )}ms and used ${formatBytes(
        process.memoryUsage().heapUsed - memoryBefore
      )}`
    );
    return result;
  };

export const eof: Parser = state =>
  state.offset >= state.input.length
    ? {
        ...state,
        ok: true,
        value: [],
      }
    : {
        ...state,
        ok: false,
        problems: [
          {
            unexpected: `"${state.input[
              state.offset
            ]!}"`,
            at: state.offset,
          },
        ],
      };

export const ignore =
  (parser: Parser): Parser =>
  state => {
    const result = parser(state);
    return result.ok
      ? { ...result, value: [] }
      : result;
  };

export const unpack = (result: Result) => {
  if (!result.ok)
    throw makeError(result.input, result.problems);
  return result.value;
};

export const map =
  (f: (value: Success["value"]) => Success["value"]) =>
  (parser: Parser): Parser =>
  state => {
    const result = parser(state);
    return result.ok
      ? {
          ...result,
          value: f(result.value),
        }
      : result;
  };

export const node =
  (type: string) =>
  (parser: Parser): Parser =>
    memo(state => {
      const result = parser(state);
      return result.ok
        ? map(children => [
            {
              type,
              children,
              offset: state.offset,
              size: result.offset - state.offset,
            },
          ])(() => result)(state)
        : result;
    });

export const nodeLeft =
  (type: string, size = 2) =>
  (parser: Parser) =>
    memo(
      map(children => {
        const offset = children[0]!.offset;
        const nodeSize =
          children[children.length - 1]!.offset +
          children[children.length - 1]!.size -
          offset;
        let i = size;
        let node: Branch = {
          type,
          children: children.slice(0, i),
          offset,
          size: nodeSize,
        };
        const step = Math.max(1, size - 1);
        while (i < children.length) {
          const sliced = children.slice(i, i + step);
          const offset = sliced[0]!.offset;
          const nodeSize =
            sliced[sliced.length - 1]!.offset - offset;
          node = {
            type,
            children: [
              node,
              ...sliced,
            ] as ReadonlyArray<Branch>,
            offset,
            size: nodeSize,
          };
          i += step;
        }
        return [node as Branch];
      })(parser)
    );

// TODO: This parser consumes all of the internal errors
export const oneOrMore =
  (parser: Parser): Parser =>
  state =>
    chain([parser, _try(oneOrMore(parser))])(state);

// TODO: This parser consumes all of the internal errors
export const zeroOrMore = (parser: Parser) =>
  _try(oneOrMore(parser));

export const trace =
  (parser: Parser): Parser =>
  state => {
    const result = parser(state);
    log(result);
    return result;
  };

export const between =
  (start: Parser) =>
  (end: Parser) =>
  (parser: Parser) =>
    chain([start, parser, end]);

export const lazy =
  (parser: () => Parser): Parser =>
  state =>
    parser()(state);

export const separatedBy =
  (sep: Parser) => (parser: Parser) =>
    chain([parser, zeroOrMore(chain([sep, parser]))]);

export const except =
  (exception: Parser) =>
  (parser: Parser): Parser =>
  state => {
    const result = exception(state);
    return result.ok
      ? {
          ...state,
          ok: false,
          problems: [
            {
              reason: `Illegal ${
                result.value.at(-1)?.type
              }`,
              at: state.offset,
            },
          ],
        }
      : parser(state);
  };

export const optional =
  (parser: Parser): Parser =>
  state => {
    const result = parser(state);
    return result.ok || result.offset !== state.offset
      ? result
      : { ...state, ok: true, value: [] };
  };

export const notBefore =
  (lookahead: Parser) =>
  (parser: Parser): Parser =>
  state => {
    const result = parser(state);
    const next = lookahead(result);
    return next.ok
      ? {
          ...result,
          ok: false,
          problems: [
            {
              unexpected: `"${result.input[
                result.offset
              ]!}"`,
              at: result.offset,
            },
          ],
        }
      : result;
  };

export const memo =
  (parser: Parser): Parser =>
  state => {
    const cached =
      state.cache[state.offset]?.get(parser);
    if (cached) return cached;
    const result = parser(state);
    (state.cache[state.offset] ??= new Map()).set(
      parser,
      result
    );
    return result;
  };

export const flatten = (
  tree: Tree
): ReadonlyArray<Token> => {
  if ((tree as Token).text) return [tree as Token];
  return (tree as Branch).children.flatMap(flatten);
};
