import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync } from 'node:fs';
import sharp from 'sharp';
import { PRESET_EXERCISES } from '../src/features/gym/store/presets.ts';
import { ADDITIONAL_EXERCISES } from '../src/features/gym/data/additional-exercises.ts';
import { getExerciseImage } from '../src/utils/workout-images.ts';
import { getExerciseGuide } from '../src/utils/exercise-guide-data.ts';
import { exerciseSchema } from '../src/features/gym/store/model.ts';

test('the expanded picker contains unique valid IDs and names', () => {
  assert.equal(new Set(PRESET_EXERCISES.map((ex) => ex.id)).size, PRESET_EXERCISES.length);
  assert.equal(
    new Set(PRESET_EXERCISES.map((ex) => ex.name.toLowerCase())).size,
    PRESET_EXERCISES.length,
  );
  for (const exercise of PRESET_EXERCISES) exerciseSchema.parse(exercise);
  assert.ok(PRESET_EXERCISES.some((ex) => ex.id === 'ex-1' && ex.name === 'Incline Chest Press'));
});

test('existing reference movements are not reintroduced under alternate names', () => {
  const duplicates = [
    'Barbell Curl',
    'Hammer Curl',
    'Preacher Curl',
    'Bulgarian Split Squat',
    'Hip Thrust',
    'Dumbbell Wrist Curl',
    'Mountain Climbers',
  ];
  for (const name of duplicates)
    assert.equal(
      ADDITIONAL_EXERCISES.some((ex) => ex.name === name),
      false,
    );
  assert.equal(PRESET_EXERCISES.filter((ex) => ex.name === 'Mountain Climbers').length, 1);
  assert.equal(ADDITIONAL_EXERCISES.filter((ex) => /Hip Thrust/.test(ex.name)).length, 1);
});

test('every new exercise has its own readable local illustration and specific guide', async () => {
  const images = new Set();
  for (const exercise of ADDITIONAL_EXERCISES) {
    const image = getExerciseImage(exercise.name);
    assert.equal(image, exercise.imageUrl);
    assert.ok(existsSync(`public${image}`), `Missing image for ${exercise.name}`);
    const metadata = await sharp(`public${image}`).metadata();
    assert.ok(metadata.width >= 512 && metadata.height >= 512);
    images.add(image);
    const guide = getExerciseGuide(exercise.name);
    assert.equal(guide.name, exercise.name);
    assert.equal(guide.category, exercise.category);
    assert.ok(guide.steps.length >= 3);
    assert.notEqual(guide.equipment, 'Gym Equipment or Bodyweight');
  }
  assert.equal(images.size, ADDITIONAL_EXERCISES.length);
});

test('exact names with mixed case resolve before similar exercise names', () => {
  for (const exercise of ADDITIONAL_EXERCISES) {
    const query = `  ${exercise.name.toLowerCase()}  `;
    assert.equal(getExerciseImage(query), exercise.imageUrl);
    assert.equal(getExerciseGuide(query).name, exercise.name);
  }
  assert.equal(getExerciseImage('Dumbbell Bicep Curl', '/custom-image.png'), '/custom-image.png');
  assert.equal(getExerciseImage('Triceps Pushdown'), '/work-out/triceps/triceps-pushdown.png');
});
