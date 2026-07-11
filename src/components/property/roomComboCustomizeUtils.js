import { INVENTORY_MEAL_PLANS } from "@/lib/propertyInventory";

export function gridKey(inventoryKey, mealPlan) {
  return `${inventoryKey}::${mealPlan}`;
}

export function buildGridFromSelections(selections) {
  const grid = {};
  for (const [inventoryKey, sel] of Object.entries(selections || {})) {
    for (const [mealPlan, count] of Object.entries(sel.plans || {})) {
      const c = Math.max(0, Number(count) || 0);
      if (c > 0) grid[`${inventoryKey}::${mealPlan}`] = c;
    }
  }
  return grid;
}

export function buildSelectionsFromGrid(gridCounts, rooms) {
  const selections = {};

  for (const room of rooms || []) {
    const inventoryKey = room.inventoryCategoryKey;
    if (!inventoryKey) continue;

    const plans = {};
    for (const mealPlan of INVENTORY_MEAL_PLANS) {
      const count = gridCounts[gridKey(inventoryKey, mealPlan)] || 0;
      if (count > 0) plans[mealPlan] = count;
    }

    if (Object.keys(plans).length > 0) {
      selections[inventoryKey] = {
        inventoryKey,
        roomId: room.id,
        categoryLabel: room.inventoryLabel || room.name,
        plans,
      };
    }
  }

  return selections;
}
