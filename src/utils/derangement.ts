export function generateDerangement<T>(items: T[]): T[] {
  const n = items.length;
  if (n === 1) {
    throw new Error("Cannot create derangement for 1 participant.");
  }
  if (n === 2) {
    // For 2 participants, just swap
    return [items[1], items[0]];
  }

  const indices = Array.from({ length: n }, (_, i) => i);

  // Shuffle
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  // Fix fixed points
  for (let i = 0; i < n; i++) {
    if (indices[i] === i) {
      if (i === n - 1) {
        [indices[i], indices[0]] = [indices[0], indices[i]];
      } else {
        [indices[i], indices[i + 1]] = [indices[i + 1], indices[i]];
      }
    }
  }

  // Final check (for paranoia)
  for (let i = 0; i < n; i++) {
    if (indices[i] === i) {
      throw new Error("Derangement generation failed.");
    }
  }

  return indices.map((idx) => items[idx]);
}
