import value from "./file";
import ignored from "./ignored-file";

it("should not trigger rebuild for ignored files", function() {
	// file.js was changed but ignored-file.ignore was also changed
	// Only file.js change should trigger rebuild
	expect(value).toBe(2);
	expect(ignored).toBe(1); // Should still be 1 because .ignore files are ignored
});
