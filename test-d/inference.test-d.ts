import { partition } from "../dist";
import { expectType } from "tsd";

function isStr(x: unknown): x is string {
  return typeof x === "string";
}

{
  // partition with type predicate
  const items: unknown[] = [1, 2, null, true, 0, "hi", false, -1];
  const [strings, others] = partition(items, isStr);
  expectType<string[]>(strings);
  expectType<unknown[]>(others);
}
