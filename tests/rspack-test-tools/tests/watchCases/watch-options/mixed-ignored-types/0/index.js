import value from "./file";
import ignored from "./ignored-file";

it("should compile and watch changes", function() {
	expect(value).toBe(1);
	expect(ignored).toBe(1);
});
