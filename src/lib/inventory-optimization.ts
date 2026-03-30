interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  unitPrice: number;
  averageDailyUsage: number;
  leadTimeDays: number;
  annualDemand?: number;
  orderingCost?: number;
  holdingCostRate?: number;
}

interface ABCResult {
  category: 'A' | 'B' | 'C';
  annualValue: number;
  cumulativePercentage: number;
}

interface EOQResult {
  economicOrderQuantity: number;
  annualOrderingCost: number;
  annualHoldingCost: number;
  totalAnnualCost: number;
  ordersPerYear: number;
  daysBetweenOrders: number;
}

interface SafetyStockResult {
  safetyStock: number;
  reorderPoint: number;
  maxStock: number;
}

// ABC Analysis: A = top 80% of value, B = next 15%, C = remaining 5%
export function abcAnalysis(items: InventoryItem[]): Map<string, ABCResult> {
  const results = new Map<string, ABCResult>();

  const itemValues = items.map(item => ({
    id: item.id,
    annualValue: (item.annualDemand || item.averageDailyUsage * 365) * item.unitPrice,
  }));

  itemValues.sort((a, b) => b.annualValue - a.annualValue);

  const totalValue = itemValues.reduce((sum, item) => sum + item.annualValue, 0);
  let cumulativeValue = 0;

  for (const item of itemValues) {
    cumulativeValue += item.annualValue;
    const cumulativePercentage = totalValue > 0 ? (cumulativeValue / totalValue) * 100 : 0;

    let category: 'A' | 'B' | 'C';
    if (cumulativePercentage <= 80) {
      category = 'A';
    } else if (cumulativePercentage <= 95) {
      category = 'B';
    } else {
      category = 'C';
    }

    results.set(item.id, {
      category,
      annualValue: item.annualValue,
      cumulativePercentage,
    });
  }

  return results;
}

// EOQ = sqrt((2 * D * S) / H)
export function calculateEOQ(item: InventoryItem): EOQResult {
  const annualDemand = item.annualDemand || item.averageDailyUsage * 365;
  const orderingCost = item.orderingCost || 50;
  const holdingCostRate = item.holdingCostRate || 0.25;
  const holdingCost = item.unitPrice * holdingCostRate;

  if (annualDemand <= 0 || holdingCost <= 0) {
    return {
      economicOrderQuantity: 0,
      annualOrderingCost: 0,
      annualHoldingCost: 0,
      totalAnnualCost: 0,
      ordersPerYear: 0,
      daysBetweenOrders: 365,
    };
  }

  const eoq = Math.ceil(Math.sqrt((2 * annualDemand * orderingCost) / holdingCost));
  const ordersPerYear = annualDemand / eoq;
  const annualOrderingCost = ordersPerYear * orderingCost;
  const annualHoldingCost = (eoq / 2) * holdingCost;
  const totalAnnualCost = annualOrderingCost + annualHoldingCost;
  const daysBetweenOrders = 365 / ordersPerYear;

  return {
    economicOrderQuantity: eoq,
    annualOrderingCost: Math.round(annualOrderingCost * 100) / 100,
    annualHoldingCost: Math.round(annualHoldingCost * 100) / 100,
    totalAnnualCost: Math.round(totalAnnualCost * 100) / 100,
    ordersPerYear: Math.round(ordersPerYear * 10) / 10,
    daysBetweenOrders: Math.round(daysBetweenOrders),
  };
}

// Safety Stock = Z * σd * √L
export function calculateSafetyStock(
  item: InventoryItem,
  demandVariability: number = 0.2,
  serviceLevel: number = 0.95
): SafetyStockResult {
  const zScores: Record<number, number> = {
    0.90: 1.28,
    0.95: 1.65,
    0.97: 1.88,
    0.99: 2.33,
  };
  const z = zScores[serviceLevel] || 1.65;

  const stdDevDemand = item.averageDailyUsage * demandVariability;
  const safetyStock = Math.ceil(z * stdDevDemand * Math.sqrt(item.leadTimeDays));

  const reorderPoint = Math.ceil(
    item.averageDailyUsage * item.leadTimeDays + safetyStock
  );

  const eoqResult = calculateEOQ(item);
  const maxStock = safetyStock + eoqResult.economicOrderQuantity;

  return {
    safetyStock,
    reorderPoint,
    maxStock,
  };
}

export function needsReorder(item: InventoryItem): boolean {
  const { reorderPoint } = calculateSafetyStock(item);
  return item.currentStock <= reorderPoint;
}

export function generateReorderRecommendations(items: InventoryItem[]) {
  const abcResults = abcAnalysis(items);

  return items
    .filter(item => needsReorder(item))
    .map(item => {
      const eoq = calculateEOQ(item);
      const safety = calculateSafetyStock(item);
      const abc = abcResults.get(item.id);

      return {
        itemId: item.id,
        itemName: item.name,
        sku: item.sku,
        currentStock: item.currentStock,
        reorderPoint: safety.reorderPoint,
        suggestedQuantity: eoq.economicOrderQuantity,
        estimatedCost: eoq.economicOrderQuantity * item.unitPrice,
        priority: abc?.category === 'A' ? 'HIGH' : abc?.category === 'B' ? 'MEDIUM' : 'LOW',
        abcCategory: abc?.category || 'C',
        leadTimeDays: item.leadTimeDays,
      };
    })
    .sort((a, b) => {
      const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      return (priorityOrder[a.priority as keyof typeof priorityOrder] || 2) -
             (priorityOrder[b.priority as keyof typeof priorityOrder] || 2);
    });
}
