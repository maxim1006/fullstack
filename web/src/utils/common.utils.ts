export const delay = (ms: number, args: any) => new Promise(res => setTimeout(res, ms, args));
export const isServer = () => typeof window === 'undefined';
