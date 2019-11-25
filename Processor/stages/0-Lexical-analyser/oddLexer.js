"use strict";
"hide implementation";

const Lexer = require("../../../Lexer-generator/Lexer-generator.js");

module.exports = new Lexer()
	.ignore("whitespace", /\s/)
	.ignore("comment", /\/\/[^\n]*/)
	.rule("string", /`.*?(?<!\\)`/)
	.rule("keyword", /for|in|while|->|if|else|is|static|var|overt|break|continue/)
	.rule("operator", /\.\.\.|[@*=\-+%^/\.!|&><]|[*=\-+%^/><!|&]=|import|export|return|await|defer|and|or|not|yield|exists|throw/)
	.rule("literal", /nothing|infinity|true|false/)
	.rule("interpunction", /[\(\)\{\}\[\],:;]/)
	.rule("number", /\d*\.\d+(?:[eE][+-]?\d+)?|\d+/)
	.rule("identifier", /[a-zA-Z][a-zA-Z-]*/);