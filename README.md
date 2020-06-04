# Odd Language

<div align="center">
<img src="./odd.svg" height="150" alt="An orange rectangle with rounded edges, with the word 'Odd' written on it. The last 'd' is raised above the rest of the word, to symbolise the quirkyness of the Odd language.">

_Hmm, that's **odd**..._
</div>

<br/>
<br/>

## 🧠 Philosophy
Odd is highly W.I.P. but these are the main goals of the language:
- Expression oriented: people don't communicate in steps -- why do we communicate with computers differently?
- Flowing syntax (like a language should have).
- Small footprint: should work on high- and low-end devices, which also allows for embedding.
- Adopt a good few parts of functional programming into developer mindset.
- No (unnecessary) dependencies: it's cute to call it _"reinventing the wheel"_, but in reality Odd doesn't need [an ASCII art of Guy fiery in some dependency's dependency](https://medium.com/s/silicon-satire/i-peeked-into-my-node-modules-directory-and-you-wont-believe-what-happened-next-b89f63d21558), or any other useless import for that fact.

<br/>
<br/>

## 🖥️ Usage
To use the Odd compiler (not finished), download it and run it through node:
```shell
node -v
# -> v13.12.0
node --harmony ./odd/compiler.js metaodd.meta.odd
# -> ✔️ Reading file DONE (311.40 μs)
# -> ✔️ Generating lexer lexer DONE (164.30 μs)
# -> ✔️ Parsing parser parser DONE (6.47 ms)
# -> ✔️ Waiting a bit to build suspense DONE (2.00 s)
# -> ✔️ Generating parser DONE (753.00 μs)
# -> ✔️ Saving parser DONE (829.50 μs)
# -> ✔️ Parsing original file with generated parser DONE (6.29 ms)
# -> Tree {
# ->   type: 'program',
# ->   children: [
# ->     Tree { type: 'metarule', children: [Array] },
# ->     Tree { type: 'metarule', children: [Array] },
# ->     Tree { type: 'metarule', children: [Array] },
# ->     Tree { type: 'metarule', children: [Array] },
# ->     Tree { type: 'metarule', children: [Array] },
# ->     Tree { type: 'metarule', children: [Array] },
# ->     Tree { type: 'metarule', children: [Array] } ] }
# -> ✔️ Cleanup DONE (303.70 μs)
```
Should work with some older versions of Node, but Odd is being developed with the newest versions of node to guarantee best performance and the newest javascript features.

When Odd is finished, it will be a standalone executable requiring no separate Node installation.

<br/>
<br/>

## 🗺️ Roadmap
Some work has yet to be done for odd to release as v1.0. The following is a list of compiler stages to get to **v1.0**:
- [x] **0.1**: Lexical Analysis of `.meta.odd` files ([Read about the lexer generator](./Lexer/README.md) or [look at the metalexer](odd/metalexer.js)).
- [x] **0.2**: Parsing of `.meta.odd` files  ([Read about the parser generator](./Parser/README.md) or [look at the metaparser](odd/metaparser.js)).
- [x] **0.3**: Building a parser from the parsed metalanguage AST ([Look at the stringifier](./odd/stringify.js)).
- [ ] **0.4**: Integrate the definition of a lexer into a meta.odd file.
- [ ] **0.4**: Integrate the means of code generation into a meta.odd file.
- [ ] **0.6**: Lexical Analysis of `.odd` files
- [ ] **0.7**: Parsing of `.odd` files
- [ ] **0.8**: Semantic Analysis of `.odd` files
- [ ] **0.9**: Type Validation of `.odd` files
- [ ] **0.10**: At least one working compilation/transpilation target (probably javascript first)
- [ ] **0.11**: Decoupling of compiler compiler and Odd's implementation to respective separate repos.

<br/>
<br/>

## 🤸 Author
Conceptualised and authored by [@maanlamp](https://github.com/maanlamp). Feel free to contribute: [Create an issue](https://github.com/oddlanguage/odd/issues/new) or get in contact otherwise.

<br/>
<br/>

## © License
Copyright 2020 Maanlamp.
[This project is licensed under MIT](./LICENSE.txt).