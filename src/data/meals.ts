// ============================================================
// Seasonal meal suggestions — healthy, lower-calorie ideas that
// rotate with the season. Pure static data (no storage), so adding
// this page never touches your saved workouts/steps.
// ============================================================

export type Season = 'spring' | 'summer' | 'autumn' | 'winter'
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface Meal {
  name: string
  kcal: number
  description: string
  tags?: string[]
}

export const SEASONS: { key: Season; label: string; emoji: string }[] = [
  { key: 'spring', label: 'Spring', emoji: '🌱' },
  { key: 'summer', label: 'Summer', emoji: '☀️' },
  { key: 'autumn', label: 'Autumn', emoji: '🍂' },
  { key: 'winter', label: 'Winter', emoji: '❄️' },
]

export const MEAL_TYPES: { key: MealType; label: string }[] = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'snack', label: 'Snack' },
]

// Current season for the northern hemisphere, by month.
export function currentSeason(d = new Date()): Season {
  const m = d.getMonth() // 0=Jan … 11=Dec
  if (m === 11 || m <= 1) return 'winter'
  if (m <= 4) return 'spring'
  if (m <= 7) return 'summer'
  return 'autumn'
}

export const MEALS: Record<Season, Record<MealType, Meal[]>> = {
  spring: {
    breakfast: [
      { name: 'Strawberry & spinach smoothie', kcal: 220, description: 'Blended strawberries, spinach, banana and yoghurt.', tags: ['veg', 'high-protein'] },
      { name: 'Wholegrain pancakes with yoghurt', kcal: 300, description: 'Light oat pancakes topped with quark and berries.', tags: ['veg'] },
      { name: 'Scrambled eggs with asparagus', kcal: 280, description: 'Soft eggs, green asparagus and chives on rye.', tags: ['high-protein'] },
    ],
    lunch: [
      { name: 'Fresh asparagus soup', kcal: 240, description: 'Light spring asparagus soup with a little crème fraîche.', tags: ['veg'] },
      { name: 'Quinoa salad with peas & radish', kcal: 350, description: 'Quinoa, garden peas, radish, lemon and mint.', tags: ['vegan', 'high-protein'] },
      { name: 'Ricotta & herb toast', kcal: 320, description: 'Wholegrain toast, ricotta and fresh garden herbs.', tags: ['veg'] },
    ],
    dinner: [
      { name: 'Grilled chicken with green asparagus', kcal: 410, description: 'Lean chicken, charred asparagus, new potatoes.', tags: ['high-protein'] },
      { name: 'Tofu stir-fry with spring onion & peas', kcal: 380, description: 'Tofu, peas and spring onion in a ginger-soy glaze.', tags: ['vegan', 'high-protein'] },
      { name: 'Wholegrain pasta primavera', kcal: 450, description: 'Wholegrain pasta with the first spring vegetables.', tags: ['veg'] },
    ],
    snack: [
      { name: 'Strawberries with quark', kcal: 140, description: 'Quark topped with sliced strawberries.', tags: ['veg', 'high-protein'] },
      { name: 'Carrot sticks with hummus', kcal: 130, description: 'Crunchy carrots and a scoop of hummus.', tags: ['vegan'] },
      { name: 'Radishes & a boiled egg', kcal: 110, description: 'Peppery radishes with a soft-boiled egg.', tags: ['high-protein'] },
    ],
  },
  summer: {
    breakfast: [
      { name: 'Berry smoothie bowl', kcal: 250, description: 'Frozen berries blended thick, topped with seeds.', tags: ['veg'] },
      { name: 'Peach overnight oats', kcal: 290, description: 'Oats soaked in milk with fresh peach and cinnamon.', tags: ['veg'] },
      { name: 'Tomato & quark toast', kcal: 270, description: 'Ripe tomato and quark on wholegrain toast.', tags: ['veg', 'high-protein'] },
    ],
    lunch: [
      { name: 'Chilled gazpacho', kcal: 180, description: 'Cold tomato, cucumber and pepper soup.', tags: ['vegan'] },
      { name: 'Greek salad with feta', kcal: 320, description: 'Cucumber, tomato, olives, red onion and feta.', tags: ['veg'] },
      { name: 'Cucumber & mint couscous salad', kcal: 350, description: 'Wholegrain couscous, cucumber, mint and lemon.', tags: ['vegan'] },
    ],
    dinner: [
      { name: 'Grilled fish with courgette', kcal: 400, description: 'White fish off the grill with charred courgette.', tags: ['high-protein'] },
      { name: 'Bean, corn & avocado salad', kcal: 380, description: 'Black beans, sweetcorn, avocado and lime.', tags: ['vegan', 'high-protein'] },
      { name: 'Veg & halloumi skewers', kcal: 430, description: 'Grilled peppers, courgette and halloumi.', tags: ['veg'] },
    ],
    snack: [
      { name: 'Watermelon with mint', kcal: 90, description: 'Cold watermelon wedges with fresh mint.', tags: ['vegan'] },
      { name: 'Frozen banana-berry nice cream', kcal: 120, description: 'Blended frozen banana and berries.', tags: ['vegan'] },
      { name: 'Cucumber yoghurt dip with crudités', kcal: 110, description: 'Yoghurt-cucumber dip with raw veg.', tags: ['veg'] },
    ],
  },
  autumn: {
    breakfast: [
      { name: 'Oats with pear & walnuts', kcal: 300, description: 'Warm oats, sliced pear and a few walnuts.', tags: ['veg'] },
      { name: 'Yoghurt with roasted plums', kcal: 230, description: 'Greek yoghurt with cinnamon-roasted plums.', tags: ['veg', 'high-protein'] },
      { name: 'Mushroom & egg toast', kcal: 310, description: 'Sautéed mushrooms and egg on wholegrain toast.', tags: ['high-protein'] },
    ],
    lunch: [
      { name: 'Carrot-ginger soup', kcal: 230, description: 'Velvety carrot soup with fresh ginger.', tags: ['vegan'] },
      { name: 'Beetroot & goat cheese salad', kcal: 340, description: 'Roasted beets, goat cheese and walnuts.', tags: ['veg'] },
      { name: 'Pumpkin quinoa bowl', kcal: 360, description: 'Roasted pumpkin, quinoa and pumpkin seeds.', tags: ['vegan', 'high-protein'] },
    ],
    dinner: [
      { name: 'Oven-roasted veg with chicken', kcal: 420, description: 'Chicken with a tray of autumn root veg.', tags: ['high-protein'] },
      { name: 'Lentil & mushroom stew', kcal: 380, description: 'Hearty lentils with mushrooms and thyme.', tags: ['vegan', 'high-protein'] },
      { name: 'Baked cod with celeriac mash', kcal: 440, description: 'Cod fillet over a light celeriac mash.', tags: ['high-protein'] },
    ],
    snack: [
      { name: 'Apple with peanut butter', kcal: 170, description: 'Crisp apple slices with a little peanut butter.', tags: ['vegan'] },
      { name: 'Roasted chickpeas', kcal: 140, description: 'Crunchy spiced roasted chickpeas.', tags: ['vegan', 'high-protein'] },
      { name: 'Grapes & walnuts', kcal: 150, description: 'A small handful of grapes and walnuts.', tags: ['vegan'] },
    ],
  },
  winter: {
    breakfast: [
      { name: 'Warm oats with apple & cinnamon', kcal: 290, description: 'Oats simmered with milk, grated apple and cinnamon.', tags: ['veg'] },
      { name: 'Greek yoghurt with pomegranate', kcal: 210, description: 'Thick yoghurt, pomegranate and a drizzle of honey.', tags: ['veg', 'high-protein'] },
      { name: 'Rye toast with egg & avocado', kcal: 320, description: 'Poached egg and smashed avocado on rye.', tags: ['high-protein'] },
    ],
    lunch: [
      { name: 'Pumpkin & red lentil soup', kcal: 280, description: 'Roasted pumpkin and lentils with ginger.', tags: ['vegan', 'high-protein'] },
      { name: 'Kale & roasted squash salad', kcal: 340, description: 'Massaged kale, squash, feta and pumpkin seeds.', tags: ['veg'] },
      { name: 'Hummus & carrot wholegrain wrap', kcal: 360, description: 'Hummus, grated carrot and spinach in a wrap.', tags: ['vegan'] },
    ],
    dinner: [
      { name: 'Roast root veg with chicken', kcal: 420, description: 'Carrot, beetroot and chicken roasted with thyme.', tags: ['high-protein'] },
      { name: 'White bean & spinach stew', kcal: 380, description: 'Slow stew with tomato, garlic and greens.', tags: ['vegan', 'high-protein'] },
      { name: 'Baked salmon with sprouts', kcal: 450, description: 'Salmon with roasted Brussels sprouts and lemon.', tags: ['high-protein'] },
    ],
    snack: [
      { name: 'Clementine & a few almonds', kcal: 150, description: 'A clementine with a small handful of almonds.', tags: ['vegan'] },
      { name: 'Warm cocoa with skim milk', kcal: 120, description: 'Unsweetened cocoa with warm skim milk.', tags: ['veg'] },
      { name: 'Roasted chestnuts', kcal: 130, description: 'A small bag of warm roasted chestnuts.', tags: ['vegan'] },
    ],
  },
}
