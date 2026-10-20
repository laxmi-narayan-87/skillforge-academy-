import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { readTextWithinLimit, validateRoadmap } from "./roadmap.ts";

const valid = {
  sections: [{ title: "Foundations", topics: ["HTML", "CSS"] }],
  resources: [{ title: "Docs", url: "https://developer.mozilla.org/", type: "documentation" }],
};

Deno.test("accepts a well-formed HTTPS roadmap", () => assertEquals(validateRoadmap(valid), true));
Deno.test("rejects missing sections", () => assertEquals(validateRoadmap({ sections: [] }), false));
Deno.test("rejects non-object root values", () => {
  for (const value of [null, [], "not an object", 42]) {
    assertEquals(validateRoadmap(value), false);
  }
});
Deno.test("rejects non-HTTPS resource URLs", () => assertEquals(validateRoadmap({
  ...valid, resources: [{ title: "Unsafe", url: "http://example.com", type: "guide" }],
}), false));
Deno.test("rejects oversized section lists", () => assertEquals(validateRoadmap({
  sections: Array.from({ length: 13 }, (_, i) => ({ title: `S${i}`, topics: ["topic"] })),
}), false));
Deno.test("rejects malformed topic values", () => assertEquals(validateRoadmap({
  sections: [{ title: "Valid", topics: ["", 42] }],
}), false));
Deno.test("rejects unknown resource types", () => assertEquals(validateRoadmap({
  ...valid, resources: [{ title: "Resource", url: "https://example.com", type: "download" }],
}), false));

Deno.test("accepts a request body at the byte limit", async () => {
  const body = new Response("abc").body;
  assertEquals(await readTextWithinLimit(body, 3), "abc");
});

Deno.test("rejects oversized request bodies while reading", async () => {
  const body = new Response("abcd").body;
  let rejected = false;
  try {
    await readTextWithinLimit(body, 3);
  } catch (error) {
    rejected = error instanceof RangeError && error.message === "Request body too large";
  }
  assertEquals(rejected, true);
});

Deno.test("measures request size in UTF-8 bytes", async () => {
  const body = new Response("éé").body;
  let rejected = false;
  try {
    await readTextWithinLimit(body, 3);
  } catch (error) {
    rejected = error instanceof RangeError;
  }
  assertEquals(rejected, true);
});
