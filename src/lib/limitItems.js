/**
 * Applies the admin's "max items to show" (0 = all) together with a hard cap
 * the layout can handle. Pure helper, safe to import from client components.
 */
export function limitItems(items, maxVisible, hardCap = Infinity) {
  const limit = maxVisible > 0 ? Math.min(maxVisible, hardCap) : hardCap;
  return items.slice(0, limit);
}
