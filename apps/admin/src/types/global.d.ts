import { Post } from "@repo/db/data";

declare global {
  interface Window {
    posts?: Post[];
    latestPost?: Post;
  }
}

export {};