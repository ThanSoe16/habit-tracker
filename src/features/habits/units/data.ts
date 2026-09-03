import { z } from 'zod';

export const unitCategorySchema = z.object({
  categoryName: z.string().trim().min(1),
  units: z.array(z.string().trim().min(1)),
});

export type UnitCategory = z.infer<typeof unitCategorySchema>;

export const MOST_POPULAR_UNITS = ['Minutes', 'Bottles', 'Cups', 'Gallons', 'Pages', 'Chapters'];

export const CATEGORIZED_UNITS = unitCategorySchema.array().parse([
  {
    categoryName: 'Count',
    units: ['Count', 'Times', 'Reps', 'Steps'],
  },
  {
    categoryName: 'Duration',
    units: ['Hours', 'Minutes', 'Seconds', 'Milliseconds'],
  },
  {
    categoryName: 'Volume',
    units: ['Gallons', 'Quarts', 'Metric Pints', 'Cups', 'Fluid Ounces', 'Tablespoons', 'Bottles'],
  },
  {
    categoryName: 'Weight',
    units: ['Kilograms', 'Grams', 'Milligrams', 'Micrograms'],
  },
  {
    categoryName: 'Length',
    units: ['Miles', 'Yards', 'Feet', 'Inches', 'Kilometers', 'Meters', 'Millimeters'],
  },
  {
    categoryName: 'Temperature',
    units: ['Degrees Fahrenheit', 'Kelvins', 'Degrees Celsius'],
  },
  {
    categoryName: 'Area',
    units: [
      'Square Miles',
      'Square Yards',
      'Square Feet',
      'Square Inches',
      'Square Kilometers',
      'Square Meters',
      'Square Centimeters',
      'Mm²',
      'Hectares',
      'A',
      'Acres',
    ],
  },
  {
    categoryName: 'Speed',
    units: ['Miles Per Hour', 'Knots', 'Kilometers Per Hour', 'Meters Per Second'],
  },
  {
    categoryName: 'Angle',
    units: ['Radians', 'Degrees'],
  },
  {
    categoryName: 'Energy',
    units: ['Kilowatt-Hours', 'Kilocalories', 'Calories', 'Joules', 'Kilojoules'],
  },
  {
    categoryName: 'Power',
    units: ['Gigawatts', 'Megawatts', 'Kilowatts', 'Watts', 'Milliwatts'],
  },
]);
