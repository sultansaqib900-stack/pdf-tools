export interface PositionedTextItem {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PositionedTextMatchArea {
  itemIndex: number;
  startRatio: number;
  endRatio: number;
}

export interface PositionedTextSearchResult {
  occurrenceCount: number;
  areas: PositionedTextMatchArea[];
}

interface CharacterSource {
  itemIndex: number;
  characterIndex: number;
}

export function normalizeSearchText(value: string): string {
  return value.toLocaleLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Finds terms in a logical text stream while retaining item-level geometry.
 * PDF.js frequently splits a visible phrase across several text-content items;
 * this mapping lets callers redact every participating fragment rather than
 * silently missing phrases that cross those implementation boundaries.
 */
export function findPositionedTextMatches(
  items: PositionedTextItem[],
  rawTerms: string[],
): PositionedTextSearchResult {
  const characters: string[] = [];
  const sources: Array<CharacterSource | null> = [];

  const appendSpace = (source: CharacterSource | null) => {
    if (characters.length > 0 && characters[characters.length - 1] !== " ") {
      characters.push(" ");
      sources.push(source);
    }
  };

  let previousItem: PositionedTextItem | null = null;
  items.forEach((item, itemIndex) => {
    if (!item.text) return;
    if (characters.length > 0 && previousItem) {
      const sameLine = Math.abs(item.y - previousItem.y) <= Math.max(item.height, previousItem.height, 1) * 0.6;
      const previousAverageWidth = previousItem.width / Math.max(previousItem.text.trim().length, 1);
      const currentAverageWidth = item.width / Math.max(item.text.trim().length, 1);
      const likelySpaceWidth = Math.max(1, (previousAverageWidth + currentAverageWidth) / 2 * 0.35);
      const horizontalGap = item.x - (previousItem.x + previousItem.width);
      const explicitlySeparated = /\s$/.test(previousItem.text) || /^\s/.test(item.text);
      if (explicitlySeparated || !sameLine || horizontalGap > likelySpaceWidth) appendSpace(null);
    }
    for (let characterIndex = 0; characterIndex < item.text.length; characterIndex += 1) {
      const character = item.text[characterIndex];
      if (/\s/.test(character)) {
        appendSpace({ itemIndex, characterIndex });
      } else {
        characters.push(character.toLocaleLowerCase());
        sources.push({ itemIndex, characterIndex });
      }
    }
    previousItem = item;
  });

  const haystack = characters.join("");
  const terms = Array.from(new Set(rawTerms.map(normalizeSearchText).filter(Boolean)));
  const areas: PositionedTextMatchArea[] = [];
  const areaKeys = new Set<string>();
  let occurrenceCount = 0;

  for (const term of terms) {
    let searchFrom = 0;
    while (searchFrom <= haystack.length - term.length) {
      const matchIndex = haystack.indexOf(term, searchFrom);
      if (matchIndex < 0) break;
      occurrenceCount += 1;

      const byItem = new Map<number, { first: number; last: number }>();
      for (let index = matchIndex; index < matchIndex + term.length; index += 1) {
        const source = sources[index];
        if (!source) continue;
        const range = byItem.get(source.itemIndex);
        if (range) {
          range.first = Math.min(range.first, source.characterIndex);
          range.last = Math.max(range.last, source.characterIndex);
        } else {
          byItem.set(source.itemIndex, {
            first: source.characterIndex,
            last: source.characterIndex,
          });
        }
      }

      for (const [itemIndex, range] of byItem) {
        const sourceLength = Math.max(items[itemIndex]?.text.length ?? 0, 1);
        const startRatio = range.first / sourceLength;
        const endRatio = (range.last + 1) / sourceLength;
        const key = `${itemIndex}:${startRatio.toFixed(8)}:${endRatio.toFixed(8)}`;
        if (areaKeys.has(key)) continue;
        areaKeys.add(key);
        areas.push({ itemIndex, startRatio, endRatio });
      }

      searchFrom = matchIndex + Math.max(1, term.length);
    }
  }

  return { occurrenceCount, areas };
}
