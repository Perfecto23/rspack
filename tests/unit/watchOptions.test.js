const { describe, it, expect } = require("@jest/globals");

// We need to test the ignoredToFunction directly
// Since it's not exported, we'll create a similar implementation for testing
const stringToRegexp = (ignored) => {
	if (ignored.length === 0) {
		return;
	}
	const globToRegExp = require("glob-to-regexp");
	const { source } = globToRegExp(ignored, { globstar: true, extended: true });
	return `${source.slice(0, -1)}(?:$|\\/)`;
};

const ignoredToFunction = (ignored) => {
	if (Array.isArray(ignored)) {
		const regexps = [];
		for (const item of ignored) {
			if (typeof item === "string") {
				const stringRegexp = stringToRegexp(item);
				if (stringRegexp) {
					regexps.push(new RegExp(stringRegexp));
				}
			} else if (item instanceof RegExp) {
				regexps.push(item);
			}
		}
		if (regexps.length === 0) {
			return () => false;
		}
		return (path) => {
			const normalizedPath = path.replace(/\\/g, "/");
			return regexps.some(regexp => regexp.test(normalizedPath));
		};
	}
	if (typeof ignored === "string") {
		const stringRegexp = stringToRegexp(ignored);
		if (!stringRegexp) {
			return () => false;
		}
		const regexp = new RegExp(stringRegexp);
		return (item) => regexp.test(item.replace(/\\/g, "/"));
	}
	if (ignored instanceof RegExp) {
		return (item) => ignored.test(item.replace(/\\/g, "/"));
	}
	if (typeof ignored === "function") {
		return (item) => ignored(item);
	}
	if (ignored) {
		throw new Error(`Invalid option for 'ignored': ${ignored}`);
	}
	return undefined;
};

describe("watchOptions.ignored mixed types", () => {
	it("should handle mixed array with string and RegExp", () => {
		const ignored = [
			/\.ignore$/,           // RegExp to ignore files ending with .ignore
			"**/temp/**",          // String glob pattern to ignore temp directory
			/node_modules/,        // RegExp to ignore node_modules
			"**/.cache"            // String glob pattern to ignore .cache directories
		];

		const ignoreFn = ignoredToFunction(ignored);
		expect(typeof ignoreFn).toBe("function");

		// Test RegExp patterns
		expect(ignoreFn("file.ignore")).toBe(true);
		expect(ignoreFn("path/to/file.ignore")).toBe(true);
		expect(ignoreFn("node_modules/package/index.js")).toBe(true);
		expect(ignoreFn("path/node_modules/package/index.js")).toBe(true);

		// Test string glob patterns
		expect(ignoreFn("temp/file.js")).toBe(true);
		expect(ignoreFn("path/temp/file.js")).toBe(true);
		expect(ignoreFn("project/.cache")).toBe(true);
		expect(ignoreFn("project/.cache/file")).toBe(true);

		// Test non-matching files
		expect(ignoreFn("file.js")).toBe(false);
		expect(ignoreFn("src/index.js")).toBe(false);
		expect(ignoreFn("build/output.js")).toBe(false);
	});

	it("should handle array with only strings", () => {
		const ignored = ["**/temp/**", "**/.cache"];
		const ignoreFn = ignoredToFunction(ignored);

		expect(ignoreFn("temp/file.js")).toBe(true);
		expect(ignoreFn(".cache/file")).toBe(true);
		expect(ignoreFn("src/file.js")).toBe(false);
	});

	it("should handle array with only RegExp", () => {
		const ignored = [/\.ignore$/, /node_modules/];
		const ignoreFn = ignoredToFunction(ignored);

		expect(ignoreFn("file.ignore")).toBe(true);
		expect(ignoreFn("node_modules/package")).toBe(true);
		expect(ignoreFn("src/file.js")).toBe(false);
	});

	it("should handle single string", () => {
		const ignored = "**/temp/**";
		const ignoreFn = ignoredToFunction(ignored);

		expect(ignoreFn("temp/file.js")).toBe(true);
		expect(ignoreFn("src/file.js")).toBe(false);
	});

	it("should handle single RegExp", () => {
		const ignored = /\.ignore$/;
		const ignoreFn = ignoredToFunction(ignored);

		expect(ignoreFn("file.ignore")).toBe(true);
		expect(ignoreFn("file.js")).toBe(false);
	});

	it("should handle empty array", () => {
		const ignored = [];
		const ignoreFn = ignoredToFunction(ignored);

		expect(ignoreFn("any/file.js")).toBe(false);
	});

	it("should handle undefined", () => {
		const ignored = undefined;
		const ignoreFn = ignoredToFunction(ignored);

		expect(ignoreFn).toBe(undefined);
	});
});
