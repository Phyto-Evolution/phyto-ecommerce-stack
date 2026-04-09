type EventMap = {
  "product.created": { productId: string; tenantId: string };
  "product.updated": { productId: string; tenantId: string };
  "post.published": { postId: string; tenantId: string; title: string; slug: string };
};

type Handler<T> = (data: T) => void | Promise<void>;

const handlers: { [K in keyof EventMap]?: Handler<EventMap[K]>[] } = {};

export const events = {
  on<K extends keyof EventMap>(event: K, handler: Handler<EventMap[K]>) {
    if (!handlers[event]) handlers[event] = [];
    handlers[event]!.push(handler);
  },
  async emit<K extends keyof EventMap>(event: K, data: EventMap[K]) {
    const eventHandlers = handlers[event];
    if (!eventHandlers) return;
    for (const handler of eventHandlers) {
      try { await handler(data); } catch (error) { console.error(`Event handler error for ${event}:`, error); }
    }
  },
};
