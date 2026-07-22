import type { SubmitEvent } from "react";

type CategoryComposerProps = {
  category: string;
  error: string;
  onCategoryChange: (category: string) => void;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

export default function CategoryComposer({
  category,
  error,
  onCategoryChange,
  onSubmit,
  onCancel,
}: CategoryComposerProps) {
  return (
    <form className="category-composer" onSubmit={onSubmit}>
      <label>
        <span className="sr-only">Category name</span>
        <input
          autoFocus
          maxLength={100}
          value={category}
          onChange={(event) => onCategoryChange(event.target.value)}
          placeholder="Name your category"
        />
      </label>
      <div className="inline-actions">
        <button className="button" type="submit">
          Continue
        </button>
        <button
          className="button button-secondary"
          type="button"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
      {error && <p className="form-error">{error}</p>}
    </form>
  );
}
