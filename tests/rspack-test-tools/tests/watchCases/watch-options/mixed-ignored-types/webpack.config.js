/** @type {import("@rspack/core").Configuration} */
module.exports = {
	mode: "development",
	watchOptions: {
		// Test mixed array with both string and RegExp
		ignored: [
			/\.ignore$/,           // RegExp to ignore files ending with .ignore
			"**/temp/**",          // String glob pattern to ignore temp directory
			/node_modules/,        // RegExp to ignore node_modules
			"**/.cache"            // String glob pattern to ignore .cache directories
		]
	}
};
