import { authedRequest } from "./shared";

export type TodoStatus = "pending" | "done";

export type Todo = {
  id: number;
  user: number;
  description: string;
  status: TodoStatus;
  category: string;
  created_at: string;
  updated_at: string;
};

export type CreateTodoPayload = {
  description: string;
  category: string;
  status: TodoStatus;
};

export function listTodos(): Promise<Todo[]> {
  return authedRequest<Todo[]>("/api/todos/");
}

export function createTodo(payload: CreateTodoPayload): Promise<Todo> {
  return authedRequest<Todo>("/api/todos/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateTodoStatus(
  id: number,
  status: TodoStatus
): Promise<Todo> {
  return authedRequest<Todo>(`/api/todos/${id}/status/`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
