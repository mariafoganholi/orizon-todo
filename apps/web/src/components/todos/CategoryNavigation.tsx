import { useCallback, useEffect, useRef, useState } from "react";

type CategoryNavigationProps = {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string) => void;
  onDeleteCategory: (category: string) => void;
  onAddCategory: () => void;
};

export default function CategoryNavigation({
  categories,
  selectedCategory,
  onSelectCategory,
  onAddCategory,
  onDeleteCategory,
}: CategoryNavigationProps) {
  const tabListRef = useRef<HTMLDivElement>(null);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(false);

  const updateScrollButtons = useCallback(() => {
    const tabList = tabListRef.current;
    if (!tabList) return;
    setCanScrollBack(tabList.scrollLeft > 1);
    setCanScrollForward(
      tabList.scrollLeft + tabList.clientWidth < tabList.scrollWidth - 1
    );
  }, []);

  useEffect(() => {
    const tabList = tabListRef.current;
    if (!tabList) return;
    updateScrollButtons();
    const observer = new ResizeObserver(updateScrollButtons);
    observer.observe(tabList);
    return () => observer.disconnect();
  }, [categories, updateScrollButtons]);

  function scrollTabs(direction: "back" | "forward") {
    tabListRef.current?.scrollBy({
      left: direction === "back" ? -240 : 240,
      behavior: "smooth",
    });
  }

  return (
    <nav className="category-nav" aria-label="Todo categories">
      <button
        className="tab-scroll-button"
        type="button"
        aria-label="Scroll categories left"
        disabled={!canScrollBack}
        onClick={() => scrollTabs("back")}
      >
        ‹
      </button>
      <div
        className="category-tabs"
        ref={tabListRef}
        onScroll={updateScrollButtons}
      >
        {categories.map((category) => {
          const isSelected = category === selectedCategory;
          return (
            <button
              className={`category-tab${isSelected ? " is-selected" : ""}`}
              key={category}
              type="button"
              aria-current={isSelected ? "page" : undefined}
              onClick={() => onSelectCategory(category)}
            >
              {category}
              {isSelected && (
                <button
                  className="delete-button"
                  type="button"
                  onClick={() => onDeleteCategory(category)}
                >
                  x
                </button>
              )}
            </button>
          );
        })}
      </div>
      <button
        className="tab-scroll-button"
        type="button"
        aria-label="Scroll categories right"
        disabled={!canScrollForward}
        onClick={() => scrollTabs("forward")}
      >
        ›
      </button>
      <button
        className="new-category-button"
        type="button"
        onClick={onAddCategory}
      >
        <span aria-hidden="true">+</span> Add new category
      </button>
    </nav>
  );
}
