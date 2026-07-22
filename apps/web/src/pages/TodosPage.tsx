import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  ApiAuthError,
  clearToken,
  createTodo,
  getToken,
  listTodos,
  updateTodoStatus,
  type Todo,
  type TodoStatus,
} from "../api/client";

const TODO_STATUSES: TodoStatus[] = ["pending", "in_progress", "done"];
const STATUS_LABELS: Record<TodoStatus, string> = {
  pending: "Pending",
  in_progress: "In progress",
  done: "Done",
};

function normalizeCategory(category: string): string {
  return category.trim();
}

function mergeCategory(categories: string[], category: string): string[] {
  const normalized = normalizeCategory(category);

  if (!normalized) return categories;

  return categories.some(
    (currentCategory) =>
      currentCategory.toLocaleLowerCase() === normalized.toLocaleLowerCase()
  )
    ? categories
    : [...categories, normalized];
}

function getCategoryDisplayValue(categories: string[], category: string): string {
  const normalized = normalizeCategory(category);
  return (
    categories.find(
      (currentCategory) =>
        currentCategory.toLocaleLowerCase() === normalized.toLocaleLowerCase()
    ) ?? normalized
  );
}

export default function TodosPage() {
  const navigate = useNavigate();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [addingTodoFor, setAddingTodoFor] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [newTodoStatus, setNewTodoStatus] = useState<TodoStatus>("pending");
  const [loading, setLoading] = useState(true);
  const [creatingTodo, setCreatingTodo] = useState(false);
  const [updatingTodoId, setUpdatingTodoId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [todoError, setTodoError] = useState("");
  const [statusError, setStatusError] = useState("");

  const handleAuthError = useCallback(
    (err: unknown) => {
      if (!(err instanceof ApiAuthError)) return false;

      clearToken();
      navigate("/login", {
        replace: true,
        state: { message: "Your session expired. Please log in again." },
      });
      return true;
    },
    [navigate]
  );

  useEffect(() => {
    if (!getToken()) {
      navigate("/login", { replace: true });
      return;
    }

    let ignore = false;

    async function loadTodos() {
      setLoading(true);
      setError("");

      try {
        const loadedTodos = await listTodos();
        if (ignore) return;

        setTodos(loadedTodos);
        setCategories(
          loadedTodos.reduce<string[]>(
            (currentCategories, todo) =>
              mergeCategory(currentCategories, todo.category),
            []
          )
        );
      } catch (err) {
        if (ignore || handleAuthError(err)) return;
        setError(err instanceof Error ? err.message : "Could not load todos");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    void loadTodos();
    return () => {
      ignore = true;
    };
  }, [handleAuthError, navigate]);

  const groupedTodos = useMemo(
    () =>
      categories.map((category) => ({
        category,
        todos: todos.filter((todo) => todo.category === category),
      })),
    [categories, todos]
  );

  function openNewCategory() {
    setCategoryError("");
    setNewCategory("");
    setIsAddingCategory(true);
  }

  function cancelNewCategory() {
    setCategoryError("");
    setNewCategory("");
    setIsAddingCategory(false);
  }

  function handleAddCategory(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const category = normalizeCategory(newCategory);

    if (!category) {
      setCategoryError("Enter a category name.");
      return;
    }

    if (category.length > 100) {
      setCategoryError("Category names can be up to 100 characters.");
      return;
    }

    const nextCategories = mergeCategory(categories, category);
    const categoryName = getCategoryDisplayValue(nextCategories, category);
    setCategories(nextCategories);
    setNewCategory("");
    setIsAddingCategory(false);
    setAddingTodoFor(categoryName);
  }

  function openTodoComposer(category: string) {
    setTodoError("");
    setDescription("");
    setNewTodoStatus("pending");
    setAddingTodoFor(category);
  }

  function cancelTodoComposer() {
    setTodoError("");
    setDescription("");
    setAddingTodoFor(null);
  }

  async function handleCreateTodo(e: FormEvent<HTMLFormElement>, category: string) {
    e.preventDefault();
    setTodoError("");
    const trimmedDescription = description.trim();

    if (!trimmedDescription) {
      setTodoError("Enter a todo description.");
      return;
    }

    setCreatingTodo(true);
    try {
      const createdTodo = await createTodo({
        description: trimmedDescription,
        category,
        status: newTodoStatus,
      });
      setTodos((currentTodos) => [createdTodo, ...currentTodos]);
      setCategories((currentCategories) =>
        mergeCategory(currentCategories, createdTodo.category)
      );
      cancelTodoComposer();
    } catch (err) {
      if (handleAuthError(err)) return;
      setTodoError(err instanceof Error ? err.message : "Could not create todo");
    } finally {
      setCreatingTodo(false);
    }
  }

  async function handleStatusChange(todo: Todo, status: TodoStatus) {
    if (todo.status === status) return;

    setStatusError("");
    setUpdatingTodoId(todo.id);
    try {
      const updatedTodo = await updateTodoStatus(todo.id, status);
      setTodos((currentTodos) =>
        currentTodos.map((currentTodo) =>
          currentTodo.id === updatedTodo.id ? updatedTodo : currentTodo
        )
      );
    } catch (err) {
      if (handleAuthError(err)) return;
      setStatusError(err instanceof Error ? err.message : "Could not update status");
    } finally {
      setUpdatingTodoId(null);
    }
  }

  return (
    <main className="todo-page">
      <header className="todo-header">
        <div>
          <p className="todo-eyebrow">Workspace</p>
          <h1>Todos</h1>
        </div>
        <div className="todo-header-actions">
          <button className="button" type="button" onClick={openNewCategory}>
            New category
          </button>
          <button
            className="button button-secondary"
            type="button"
            onClick={() => {
              clearToken();
              navigate("/login", { replace: true });
            }}
          >
            Log out
          </button>
        </div>
      </header>

      {error && <p className="alert alert-error">{error}</p>}
      {statusError && <p className="alert alert-error">{statusError}</p>}

      <section className="todo-list" aria-live="polite">
        {isAddingCategory && (
          <form className="category-group category-group-new" onSubmit={handleAddCategory}>
            <label className="category-title-input">
              <span className="sr-only">Category title</span>
              <input
                autoFocus
                maxLength={100}
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Category title"
              />
            </label>
            <div className="inline-actions">
              <button className="button" type="submit">
                Add category
              </button>
              <button className="button button-secondary" type="button" onClick={cancelNewCategory}>
                Cancel
              </button>
            </div>
            {categoryError && <p className="form-error">{categoryError}</p>}
          </form>
        )}

        {loading ? (
          <p className="muted">Loading todos...</p>
        ) : groupedTodos.length === 0 && !isAddingCategory ? (
          <div className="empty-state">
            <p>Organize your next tasks into categories.</p>
            <button className="button" type="button" onClick={openNewCategory}>
              New category
            </button>
          </div>
        ) : (
          groupedTodos.map(({ category, todos: categoryTodos }) => (
            <section className="category-group" key={category}>
              <div className="category-heading">
                <h2>{category}</h2>
                <span aria-label={`${categoryTodos.length} todos`}>{categoryTodos.length}</span>
              </div>

              <ul>
                {categoryTodos.map((todo) => (
                  <li className="todo-item" key={todo.id}>
                    <p>{todo.description}</p>
                    <select
                      aria-label={`Status for ${todo.description}`}
                      value={todo.status}
                      disabled={updatingTodoId === todo.id}
                      onChange={(e) => void handleStatusChange(todo, e.target.value as TodoStatus)}
                    >
                      {TODO_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  </li>
                ))}
              </ul>

              {addingTodoFor === category ? (
                <form className="new-todo-form" onSubmit={(e) => void handleCreateTodo(e, category)}>
                  <label>
                    <span className="sr-only">Todo description</span>
                    <textarea
                      autoFocus
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What needs to be done?"
                      rows={2}
                      required
                    />
                  </label>
                  <div className="new-todo-footer">
                    <label className="status-picker">
                      Status
                      <select value={newTodoStatus} onChange={(e) => setNewTodoStatus(e.target.value as TodoStatus)}>
                        {TODO_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="inline-actions">
                      <button className="button" type="submit" disabled={creatingTodo}>
                        {creatingTodo ? "Adding..." : "Add todo"}
                      </button>
                      <button className="button button-secondary" type="button" onClick={cancelTodoComposer}>
                        Cancel
                      </button>
                    </div>
                  </div>
                  {todoError && <p className="form-error">{todoError}</p>}
                </form>
              ) : (
                <button className="add-todo-button" type="button" onClick={() => openTodoComposer(category)}>
                  + Add todo
                </button>
              )}
            </section>
          ))
        )}
      </section>
    </main>
  );
}
