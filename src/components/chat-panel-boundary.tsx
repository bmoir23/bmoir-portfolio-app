"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type ChatPanelBoundaryProps = {
  children: ReactNode;
  onClose: () => void;
  className?: string;
};

type ChatPanelBoundaryState = {
  error: Error | null;
};

/**
 * Isolates lazy ChatbotPanel failures so a chunk load / render error cannot
 * take down the whole NavbarIsland (dock + chat bubble).
 */
export class ChatPanelBoundary extends Component<
  ChatPanelBoundaryProps,
  ChatPanelBoundaryState
> {
  state: ChatPanelBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ChatPanelBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ChatbotPanel failed to load", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          role="alert"
          className={cn(
            "w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-border bg-card/95 p-4 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)] backdrop-blur-md",
            this.props.className,
          )}
        >
          <p className="text-sm font-medium text-foreground">
            Chat couldn’t load
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Refresh the page or try again in a moment.
          </p>
          <button
            type="button"
            className="mt-3 rounded-lg border border-border px-3 py-1.5 text-sm text-foreground hover:bg-muted"
            onClick={this.props.onClose}
          >
            Close
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export function ChatPanelSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading chat assistant"
      className={cn(
        "w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-card/95 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)] backdrop-blur-md",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
        <div className="h-4 w-28 animate-pulse rounded bg-muted" />
        <div className="size-6 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="space-y-3 p-4">
        <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-10 w-full animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  );
}
