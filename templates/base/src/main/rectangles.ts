/** The example command: a row of orange rectangles on the current page, then selected and framed. */
export async function createRectangles(count: number): Promise<RectangleNode[]> {
  const nodes: RectangleNode[] = [];
  for (let i = 0; i < count; i++) {
    const rect = figma.createRectangle();
    rect.x = i * 150;
    rect.fills = [{ type: 'SOLID', color: { r: 1, g: 0.5, b: 0 } }];
    figma.currentPage.appendChild(rect);
    nodes.push(rect);
  }
  figma.currentPage.selection = nodes;
  figma.viewport.scrollAndZoomIntoView(nodes);
  return nodes;
}
