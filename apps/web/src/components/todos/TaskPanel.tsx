import type { SubmitEvent } from "react";
import type { Todo, TodoStatus } from "../../api/todo";
import { TaskRow } from "./TaskRow";

type TaskPanelProps = {
  category: string;
  activeTodos: Todo[];
  completedTodos: Todo[];
  description: string;
  isComposerOpen: boolean;
  isCreating: boolean;
  updatingTodoId: number | null;
  error: string;
  onDescriptionChange: (description: string) => void;
  onOpenComposer: () => void;
  onCancelComposer: () => void;
  onCreateTodo: (event: SubmitEvent<HTMLFormElement>) => void;
  onStatusChange: (todo: Todo, status: TodoStatus) => void;
  onDeleteTodo: (todo: Todo) => void;
};

export default function TaskPanel({
  category,
  activeTodos,
  completedTodos,
  description,
  isComposerOpen,
  isCreating,
  updatingTodoId,
  error,
  onDescriptionChange,
  onOpenComposer,
  onCancelComposer,
  onCreateTodo,
  onStatusChange,
  onDeleteTodo,
}: TaskPanelProps) {
  return (
    <section className="task-panel" aria-live="polite">
      <div className="task-panel-heading">
        <h2>{category}</h2>
        <span>{activeTodos.length} active</span>
      </div>

      <ul className="task-list" aria-label={`Active tasks in ${category}`}>
        {activeTodos.map((todo) => (
          <TaskRow
            key={todo.id}
            todo={todo}
            completed={false}
            disabled={updatingTodoId === todo.id}
            onStatusChange={onStatusChange}
            onDeleteTodo={onDeleteTodo}
          />
        ))}
      </ul>

      {isComposerOpen ? (
        <form className="new-task-form" onSubmit={onCreateTodo}>
          <label>
            <span className="sr-only">New task</span>
            <input
              autoFocus
              value={description}
              onChange={(event) => onDescriptionChange(event.target.value)}
              placeholder="What needs to be done?"
            />
          </label>
          <div className="inline-actions">
            <button className="button" disabled={isCreating} type="submit">
              {isCreating ? "Adding…" : "Add item"}
            </button>
            <button
              className="button button-secondary"
              disabled={isCreating}
              type="button"
              onClick={onCancelComposer}
            >
              Cancel
            </button>
          </div>
          {error && <p className="form-error">{error}</p>}
        </form>
      ) : (
        <button
          className="add-item-button"
          type="button"
          onClick={onOpenComposer}
        >
          <span aria-hidden="true">+</span> Add new item
        </button>
      )}

      {completedTodos.length > 0 && (
        <section className="completed-section">
          <h3>
            Completed <span aria-hidden="true">✓</span>
          </h3>
          <ul
            className="task-list"
            aria-label={`Completed tasks in ${category}`}
          >
            {completedTodos.map((todo) => (
              <TaskRow
                key={todo.id}
                todo={todo}
                completed
                disabled={updatingTodoId === todo.id}
                onStatusChange={onStatusChange}
                onDeleteTodo={onDeleteTodo}
              />
            ))}
          </ul>
        </section>
      )}
    </section>
  );
}
