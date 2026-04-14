export function buildRecommendationPrompt(
  vehicles: any[],
  preferences: any,
): string {
  const vehicleSummaries = vehicles.map((v) => ({
    id: v.id,
    brand: v.model?.brand?.name,
    model: v.model?.name,
    trim: v.trimName,
    year: v.year,
    price: v.price,
    currency: v.market?.currency,
    condition: v.condition,
    fuelType: v.fuelType,
    transmission: v.transmission,
    horsepower: v.horsepower,
    mileageKm: v.mileageKm,
    bodyType: v.model?.bodyType,
    score: v.score,
  }));

  const parts: string[] = [];

  parts.push('Here are the top vehicle candidates from our inventory:\n');
  parts.push('```json');
  parts.push(JSON.stringify(vehicleSummaries, null, 2));
  parts.push('```\n');

  if (preferences && Object.keys(preferences).length > 0) {
    parts.push("The user's preferences are:\n");
    parts.push('```json');
    parts.push(JSON.stringify(preferences, null, 2));
    parts.push('```\n');
  }

  parts.push(
    'Based on these vehicles and the user\'s preferences, explain why these cars are good matches. ' +
      'Highlight the strengths of each option and help the user understand the trade-offs between them.',
  );

  return parts.join('\n');
}
