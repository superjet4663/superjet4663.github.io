export declare global {
  interface CustomEventMap {
    nav: CustomEvent<{ url: FullSlug }>
    themechange: CustomEvent<{ theme: "light" | "dark" }>
  }

  interface Document {
    addEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Document, ev: CustomEventMap[K]) => void,
    ): void
    removeEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Document, ev: CustomEventMap[K]) => void,
    ): void
    dispatchEvent<K extends keyof CustomEventMap>(ev: CustomEventMap[K] | UIEvent): void
  }

  interface Window {
    // Navigation functions
    spaNavigate(url: URL, isBack?: boolean): void
    notifyNav(url: FullSlug): void
    
    // Cleanup function
    addCleanup(fn: (...args: any[]) => void): void
    
    // Plugin data
    stacked: import("./quartz/plugins/types").Notes
    
    // External libraries
    plausible: {
      (eventName: string, options: { props: { path: string } }): void
    }
    twttr: {
      ready(f: (twttr: any) => void): void
    }
    mermaid: typeof import("mermaid/dist/mermaid").default
    
   
    // Navigation functions (for components that might use it)
    navigateToRandomPage?: () => void
  }

  interface HTMLElementEventMap {
    nav: CustomEvent<{ url: FullSlug }>
  }
}