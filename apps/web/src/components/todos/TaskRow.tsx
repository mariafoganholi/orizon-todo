import type { Todo, TodoStatus } from "../../api/todo";

export function TaskRow({
  todo,
  completed,
  disabled,
  onStatusChange,
  onDeleteTodo,
}: {
  todo: Todo;
  completed: boolean;
  disabled: boolean;
  onStatusChange: (todo: Todo, status: TodoStatus) => void;
  onDeleteTodo: (todo: Todo) => void;
}) {
  return (
    <li className={`task-row${completed ? " is-completed" : ""}`}>
      <input
        aria-label={`Mark ${todo.description} as ${
          completed ? "active" : "completed"
        }`}
        checked={completed}
        disabled={disabled}
        type="checkbox"
        onChange={() => onStatusChange(todo, completed ? "pending" : "done")}
      />
      <span>{todo.description} </span>
      <button
        className="delete-button"
        type="button"
        onClick={() => onDeleteTodo(todo)}
      >
        x
      </button>
    </li>
  );
}
