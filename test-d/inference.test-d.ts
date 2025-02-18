import { partition, partitionN } from "../dist";
import { expectType } from "tsd";

function isStr(x: unknown): x is string {
  return typeof x === "string";
}

function isNum(x: unknown): x is number {
  return typeof x === "number";
}

function isPosNum(x: unknown): x is number {
  return isNum(x) && x >= 0;
}

const x = -32 as string | number;
if (isPosNum(x)) {
  x.toFixed(2); // x is number
} else {
  x.length; // x is number
}

{
  // partition with type predicate
  const items: unknown[] = [1, 2, null, true, 0, "hi", false, -1];
  const [strings, others] = partition(items, isStr);
  expectType<string[]>(strings);
  expectType<unknown[]>(others);
}

{
  // partitionN with 2 (type) predicates
  const items: unknown[] = [1, 2, null, true, 0, "hi", false, -1];
  const [strings, numbers, others] = partitionN(items, isStr, isNum);
  expectType<string[]>(strings);
  expectType<number[]>(numbers);
  expectType<unknown[]>(others);
}

{
  // partitionN with no type predicate
  const items: unknown[] = [1, 2, null, true, 0, "hi", false, -1];
  const [strings, numbers, others] = partitionN(
    items,
    (x) => String(typeof x) === "string",
    (x) => String(typeof x) === "number",
  );
  expectType<unknown[]>(strings);
  expectType<unknown[]>(numbers);
  expectType<unknown[]>(others);
}

{
  // partitionN with no type predicate
  const items: unknown[] = [1, 2, null, true, 0, "hi", false, -1];
  const [strings, numbers, others] = partitionN(
    items,
    (x) => String(typeof x) === "string",
    (x) => String(typeof x) === "number",
  );
  expectType<unknown[]>(strings);
  expectType<unknown[]>(numbers);
  expectType<unknown[]>(others);
}

{
  const values = ["hi", 3, null, "foo", -7];
  const [nums, rest] = partitionN(values, isPosNum);
  expectType<number[]>(nums);
  expectType<(string | number | boolean)[]>(rest);
}
