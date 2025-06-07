import type { Post } from "@repo/db/data";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { BlogList } from "./List";

export const post1: Post = {
  title: "Hello, World!",
  date: new Date("01 Oct 2024"),
  tags: "Hello,World",
  category: "Cat",
  content: "Content of Hello World",
  description: "Description of Hello World",
  id: 1,
  imageUrl: "https://example.com/image.jpg",
  likes: 30,
  active: true,
  urlId: "hello-world",
  views: 200,
};

export const post2: Post = {
  title: "Hola, Mundo!",
  date: new Date("01 May 2022"),
  tags: "Hola,Mundo",
  category: "Kat",
  content: "Contento del Hola Mundo",
  description: "Descripcion de Hola Mundo",
  id: 2,
  imageUrl: "https://example.com/image.jpg",
  likes: 550,
  active: true,
  urlId: "hola-mundo",
  views: 1000,
};

test("renders 0 posts when no posts are present", async () => {
  const { getByText } = render(<BlogList posts={[]} />);
  await expect.element(getByText("0 Posts")).toBeInTheDocument();
});

test("renders initial batch of posts", async () => {
  const component = render(<BlogList posts={[post1, post2]} />);

  // With our POSTS_PER_PAGE = 5, both posts should be visible initially
  await expect(
    component.baseElement.getElementsByTagName("article"),
  ).toHaveLength(2);
  await expect.element(component.getByText("Hello, World!")).toBeInTheDocument();
  await expect.element(component.getByText("Hola, Mundo!")).toBeInTheDocument();
});

// Test for multiple posts where pagination will occur
test("supports infinite scroll with more posts", async () => {
  // Create more posts to test pagination
  const morePosts = Array.from({ length: 10 }, (_, i) => ({
    ...post1,
    id: i + 1,
    title: `Post ${i + 1}`,
    urlId: `post-${i + 1}`,
  }));
  
  const component = render(<BlogList posts={morePosts} />);
  
  // Initially only the first batch (POSTS_PER_PAGE = 5) should be rendered
  await expect(
    component.baseElement.getElementsByTagName("article"),
  ).toHaveLength(5);
  
  // First post should be visible
  await expect.element(component.getByText("Post 1")).toBeInTheDocument();
  
  // Loading element should be present for more posts
  const loadingElement = component.baseElement.querySelector("div.py-4.text-center");
  await expect(loadingElement).toBeInTheDocument();
  
  // Load more button should be visible
  await expect.element(component.getByText("Load more posts")).toBeInTheDocument();
});

test("load more button loads additional posts", async () => {
  // Create more posts to test pagination
  const morePosts = Array.from({ length: 10 }, (_, i) => ({
    ...post1,
    id: i + 1,
    title: `Post ${i + 1}`,
    urlId: `post-${i + 1}`,
  }));
  
  const component = render(<BlogList posts={morePosts} />);
  
  // Initially only shows 5 posts
  await expect(
    component.baseElement.getElementsByTagName("article"),
  ).toHaveLength(5);
  
  // Click the load more button
  await component.getByText("Load more posts").click();
  
  // We need to wait for the timeout in the loadMorePosts function
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Now should show more posts (total of 10)
  await expect(
    component.baseElement.getElementsByTagName("article"),
  ).toHaveLength(10);
});
