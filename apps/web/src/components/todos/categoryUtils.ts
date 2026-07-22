import type { Todo } from "../../api/client";

export function normalizeCategory(category: string): string {
  return category.trim();
}

export function sameCategory(first: string, second: string): boolean {
  return first.localeCompare(second, undefined, { sensitivity: "accent" }) === 0;
}

export function getCategories(todos: Todo[], draftCategory: string | null): string[] {
  const categories: string[] = [];

  for (const todo of todos) {
    if (!categories.some((category) => sameCategory(category, todo.category))) {
      categories.push(todo.category);
    }
  }

  if (draftCategory && !categories.some((category) => sameCategory(category, draftCategory))) {
    categories.unshift(draftCategory);
  }

  return categories;
}
