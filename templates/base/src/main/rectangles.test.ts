import { describe, expect, it } from 'vitest';
import { createRectangles } from './rectangles';

describe('createRectangles', () => {
  it('creates, appends and selects count rectangles', async () => {
    const nodes = await createRectangles(3);
    expect(nodes).toHaveLength(3);
    expect(figma.createRectangle).toHaveBeenCalledTimes(3);
    expect(figma.currentPage.appendChild).toHaveBeenCalledTimes(3);
    expect(figma.currentPage.selection).toHaveLength(3);
    expect(nodes[2].x).toBe(300);
  });
});
