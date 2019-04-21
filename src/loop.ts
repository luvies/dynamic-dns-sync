export async function* loop(
  interval: number,
  opts: {
    max?: number;
  } = {},
): AsyncIterableIterator<number> {
  const max = opts.max || +Infinity;

  for (let i = 0; i < max; i++) {
    yield i;
    await new Promise(resolve => setTimeout(resolve, interval));
  }
}
