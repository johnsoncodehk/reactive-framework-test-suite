declare module "pota" {
  export const createSignal: any;
  export const memo: any;
  export const effect: any;
  export const batch: any;
  export const root: any;
  export const cleanup: any;
  export const untrack: any;
}

declare module "solid-js/dist/solid.cjs" {
  export const createSignal: any;
  export const createMemo: any;
  export const createComputed: any;
  export const createRoot: any;
  export const batch: any;
  export const untrack: any;
  export const onCleanup: any;
}
