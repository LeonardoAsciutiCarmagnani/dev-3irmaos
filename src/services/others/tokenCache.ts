import NodeCache from "node-cache";

export const tokenCache = new NodeCache({ stdTTL: 0 });
