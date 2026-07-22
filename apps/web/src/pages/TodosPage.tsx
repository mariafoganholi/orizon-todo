import { useEffect, useMemo, useState, type SubmitEvent } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  createTodo,
  listTodos,
  updateTodoStatus,
  type Todo,
  type TodoStatus,
} from "../api/todo";
import CategoryComposer from "../components/todos/CategoryComposer";
import CategoryNavigation from "../components/todos/CategoryNavigation";
import TaskPanel from "../components/todos/TaskPanel";
import {
  getCategories,
  normalizeCategory,
  sameCategory,
} from "../components/todos/categoryUtils";
import type { AuthOutletContext } from "../components/ProtectedRoute";

export default function TodosPage() {
  const navigate = useNavigate();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [draftCategory, setDraftCategory] = useState<string | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [addingTodoFor, setAddingTodoFor] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [creatingTodo, setCreatingTodo] = useState(false);
  const [updatingTodoId, setUpdatingTodoId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [todoError, setTodoError] = useState("");
  const [statusError, setStatusError] = useState("");
  const { handleAuthError, user, logout } =
    useOutletContext<AuthOutletContext>();

  useEffect(() => {
    let ignore = false;
    async function loadTodos() {
      setLoading(true);
      setError("");
      try {
        const loadedTodos = await listTodos();
        if (ignore) return;
        setTodos(loadedTodos);
        setSelectedCategory(getCategories(loadedTodos, null)[0] ?? null);
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

  const categories = useMemo(
    () => getCategories(todos, draftCategory),
    [todos, draftCategory]
  );
  const selectedTodos = useMemo(
    () =>
      selectedCategory
        ? todos.filter((todo) => sameCategory(todo.category, selectedCategory))
        : [],
    [selectedCategory, todos]
  );
  const activeTodos = selectedTodos.filter((todo) => todo.status === "pending");
  const completedTodos = selectedTodos.filter((todo) => todo.status === "done");

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

  function handleAddCategory(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const category = normalizeCategory(newCategory);
    if (!category) {
      setCategoryError("Enter a category name.");
      return;
    }
    if (category.length > 100) {
      setCategoryError("Category names can be up to 100 characters.");
      return;
    }

    const existingCategory = categories.find((current) =>
      sameCategory(current, category)
    );
    const categoryToSelect = existingCategory ?? category;
    setDraftCategory(existingCategory ? draftCategory : categoryToSelect);
    setSelectedCategory(categoryToSelect);
    setAddingTodoFor(categoryToSelect);
    setDescription("");
    setTodoError("");
    cancelNewCategory();
  }

  function selectCategory(category: string) {
    setSelectedCategory(category);
    setAddingTodoFor(null);
    setTodoError("");
  }

  function openTodoComposer(category: string) {
    setTodoError("");
    setDescription("");
    setAddingTodoFor(category);
  }

  function cancelTodoComposer() {
    const wasDraft =
      addingTodoFor &&
      draftCategory &&
      sameCategory(addingTodoFor, draftCategory);
    setTodoError("");
    setDescription("");
    setAddingTodoFor(null);
    if (wasDraft) {
      setDraftCategory(null);
      setSelectedCategory(getCategories(todos, null)[0] ?? null);
    }
  }

  async function handleCreateTodo(
    event: SubmitEvent<HTMLFormElement>,
    category: string
  ) {
    event.preventDefault();
    const trimmedDescription = description.trim();
    setTodoError("");
    if (!trimmedDescription) {
      setTodoError("Enter a todo description.");
      return;
    }

    setCreatingTodo(true);
    try {
      const createdTodo = await createTodo({
        description: trimmedDescription,
        category,
        status: "pending",
      });
      setTodos((currentTodos) => [createdTodo, ...currentTodos]);
      setSelectedCategory(createdTodo.category);
      setDraftCategory(null);
      setDescription("");
      setAddingTodoFor(null);
    } catch (err) {
      if (handleAuthError(err)) return;
      setTodoError(
        err instanceof Error ? err.message : "Could not create todo"
      );
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
      setStatusError(
        err instanceof Error ? err.message : "Could not update status"
      );
    } finally {
      setUpdatingTodoId(null);
    }
  }

  return (
    <main className="todo-page">
      <header className="workspace-header">
        <div>
          <p className="todo-eyebrow">Workspace</p>
          <h1>{user.first_name} TODO list</h1>
        </div>
        <button
          className="logout-button"
          type="button"
          onClick={() => {
            logout();
          }}
        >
          Log out
        </button>
      </header>

      {error && <p className="alert alert-error">{error}</p>}
      {statusError && <p className="alert alert-error">{statusError}</p>}

      {!loading && (
        <>
          <CategoryNavigation
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={selectCategory}
            onAddCategory={openNewCategory}
          />

          {isAddingCategory && (
            <CategoryComposer
              category={newCategory}
              error={categoryError}
              onCategoryChange={setNewCategory}
              onSubmit={handleAddCategory}
              onCancel={cancelNewCategory}
            />
          )}

          {categories.length === 0 && !isAddingCategory ? (
            <section className="empty-state">
              <h2>Create your first category</h2>
              <p>Group the things you want to get done.</p>
              <button
                className="button"
                type="button"
                onClick={openNewCategory}
              >
                Add new category
              </button>
            </section>
          ) : selectedCategory ? (
            <TaskPanel
              category={selectedCategory}
              activeTodos={activeTodos}
              completedTodos={completedTodos}
              description={description}
              isComposerOpen={Boolean(
                addingTodoFor && sameCategory(addingTodoFor, selectedCategory)
              )}
              isCreating={creatingTodo}
              updatingTodoId={updatingTodoId}
              error={todoError}
              onDescriptionChange={setDescription}
              onOpenComposer={() => openTodoComposer(selectedCategory)}
              onCancelComposer={cancelTodoComposer}
              onCreateTodo={(event) =>
                void handleCreateTodo(event, selectedCategory)
              }
              onStatusChange={(todo, status) =>
                void handleStatusChange(todo, status)
              }
            />
          ) : null}
        </>
      )}

      {loading && <p className="muted">Loading tasks…</p>}
    </main>
  );
}
