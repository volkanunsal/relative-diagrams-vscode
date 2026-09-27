export function namespaceIds(svg: string, prefix: string): string {
  return svg.replace(/<[^>]*>/g, (tag) =>
    tag
      .replace(/\bid="([^"]+)"/g, (_match, id: string) => `id="${prefix}${id}"`)
      .replace(/="url\(#([^)"]+)\)"/g, (_match, id: string) => `="url(#${prefix}${id})"`),
  );
}
