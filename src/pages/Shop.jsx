import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { products, categories, brands, priceBounds } from "../data/products";
import ProductCard from "../components/ProductCard";
import {
  IconFilter,
  IconClose,
  IconGrid,
  IconList,
  IconChevronLeft,
  IconChevronRight,
} from "../components/Icons";

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "popular", label: "Most Reviewed" },
];

const PER_PAGE = 9;

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [view, setView] = useState("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  const q = params.get("q") || "";
  const activeCategory = params.get("category") || "";
  const activeTag = params.get("tag") || "";
  const sort = params.get("sort") || "featured";
  const maxPrice = Number(params.get("max") || priceBounds.max);
  const minRating = Number(params.get("rating") || 0);
  const activeBrands = (params.get("brands") || "").split(",").filter(Boolean);
  const inStockOnly = params.get("stock") === "1";

  const update = (patch, resetPage = true) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => {
      if (v == null || v === "" || (Array.isArray(v) && v.length === 0)) next.delete(k);
      else next.set(k, Array.isArray(v) ? v.join(",") : String(v));
    });
    setParams(next, { replace: true });
    if (resetPage) setPage(1);
  };

  useEffect(() => setPage(1), [q, activeCategory, activeTag, sort, maxPrice, minRating, activeBrands.join(","), inStockOnly]);

  const filtered = useMemo(() => {
    let list = products.slice();
    if (q) {
      const needle = q.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(needle) ||
          p.brand.toLowerCase().includes(needle) ||
          p.category.toLowerCase().includes(needle) ||
          p.tags.some((t) => t.includes(needle))
      );
    }
    if (activeCategory) list = list.filter((p) => p.category === activeCategory);
    if (activeTag) list = list.filter((p) => p.tags.includes(activeTag));
    if (activeBrands.length) list = list.filter((p) => activeBrands.includes(p.brand));
    list = list.filter((p) => p.price <= maxPrice);
    if (minRating) list = list.filter((p) => p.rating >= minRating);
    if (inStockOnly) list = list.filter((p) => p.stock > 0);

    switch (sort) {
      case "price-asc": list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "rating": list.sort((a, b) => b.rating - a.rating); break;
      case "popular": list.sort((a, b) => b.reviews - a.reviews); break;
      default: list.sort((a, b) => (b.tags.includes("featured") ? 1 : 0) - (a.tags.includes("featured") ? 1 : 0));
    }
    return list;
  }, [q, activeCategory, activeTag, activeBrands.join(","), maxPrice, minRating, inStockOnly, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const toggleBrand = (brand) => {
    const next = activeBrands.includes(brand)
      ? activeBrands.filter((b) => b !== brand)
      : [...activeBrands, brand];
    update({ brands: next });
  };

  const hasFilters =
    q || activeCategory || activeTag || maxPrice < priceBounds.max || minRating || activeBrands.length || inStockOnly;

  const clearAll = () => setParams(new URLSearchParams(), { replace: true });

  const activeCatName = categories.find((c) => c.id === activeCategory)?.name;

  const FiltersPanel = (
    <div className="filters">
      <div className="filters__head">
        <strong>Filters</strong>
        <button className="icon-btn" onClick={() => setFiltersOpen(false)} aria-label="Close filters">
          <IconClose />
        </button>
      </div>

      <div className="filter-group">
        <h4>Category</h4>
        <div className="filter-list">
          {categories.map((c) => (
            <label key={c.id} className="filter-radio">
              <input
                type="radio"
                name="category"
                checked={activeCategory === c.id}
                onChange={() => update({ category: c.id, tag: "" })}
              />
              <span>{c.icon} {c.name}</span>
            </label>
          ))}
          <label className="filter-radio">
            <input
              type="radio"
              name="category"
              checked={!activeCategory}
              onChange={() => update({ category: "" })}
            />
            <span>All categories</span>
          </label>
        </div>
      </div>

      <div className="filter-group">
        <h4>Price range</h4>
        <input
          type="range"
          min={priceBounds.min}
          max={priceBounds.max}
          value={maxPrice}
          onChange={(e) => update({ max: e.target.value })}
          className="range"
        />
        <div className="filter-range-labels">
          <span>${priceBounds.min}</span>
          <span>Up to <strong>${maxPrice}</strong></span>
        </div>
      </div>

      <div className="filter-group">
        <h4>Brand</h4>
        <div className="filter-list filter-list--scroll">
          {brands.map((b) => (
            <label key={b} className="filter-check">
              <input type="checkbox" checked={activeBrands.includes(b)} onChange={() => toggleBrand(b)} />
              <span>{b}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h4>Rating</h4>
        <div className="filter-list">
          {[4, 3, 2].map((r) => (
            <label key={r} className="filter-radio">
              <input
                type="radio"
                name="rating"
                checked={minRating === r}
                onChange={() => update({ rating: r })}
              />
              <span>{"★".repeat(r)}{"☆".repeat(5 - r)} & up</span>
            </label>
          ))}
          <label className="filter-radio">
            <input type="radio" name="rating" checked={!minRating} onChange={() => update({ rating: "" })} />
            <span>All ratings</span>
          </label>
        </div>
      </div>

      <div className="filter-group">
        <label className="filter-check filter-check--switch">
          <input type="checkbox" checked={inStockOnly} onChange={(e) => update({ stock: e.target.checked ? "1" : "" })} />
          <span>In stock only</span>
        </label>
      </div>

      <button className="btn btn--ghost btn--block" onClick={clearAll}>Clear all filters</button>
    </div>
  );

  return (
    <div className="container page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link> <span>/</span> <span>Shop</span>
        {activeCatName && <><span>/</span> <span>{activeCatName}</span></>}
      </nav>

      <div className="shop__head">
        <div>
          <h1 className="page__title">
            {activeCatName || (q ? `Results for “${q}”` : activeTag ? `${activeTag} products` : "All products")}
          </h1>
          <p className="page__sub">{filtered.length} product{filtered.length !== 1 ? "s" : ""} found</p>
        </div>
        <div className="shop__toolbar">
          <button className="btn btn--ghost btn--sm shop__filter-btn" onClick={() => setFiltersOpen(true)}>
            <IconFilter size={16} /> Filters
          </button>
          <div className="view-toggle">
            <button className={view === "grid" ? "is-active" : ""} onClick={() => setView("grid")} aria-label="Grid view">
              <IconGrid size={18} />
            </button>
            <button className={view === "list" ? "is-active" : ""} onClick={() => setView("list")} aria-label="List view">
              <IconList size={18} />
            </button>
          </div>
          <label className="select">
            <span>Sort</span>
            <select value={sort} onChange={(e) => update({ sort: e.target.value })}>
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </label>
        </div>
      </div>

      {hasFilters && (
        <div className="chips">
          {q && <span className="chip">“{q}” <button onClick={() => update({ q: "" })}>×</button></span>}
          {activeCategory && <span className="chip">{activeCatName} <button onClick={() => update({ category: "" })}>×</button></span>}
          {activeTag && <span className="chip">{activeTag} <button onClick={() => update({ tag: "" })}>×</button></span>}
          {activeBrands.map((b) => <span className="chip" key={b}>{b} <button onClick={() => toggleBrand(b)}>×</button></span>)}
          {maxPrice < priceBounds.max && <span className="chip">≤ ${maxPrice} <button onClick={() => update({ max: "" })}>×</button></span>}
          {minRating > 0 && <span className="chip">{minRating}★ & up <button onClick={() => update({ rating: "" })}>×</button></span>}
          {inStockOnly && <span className="chip">In stock <button onClick={() => update({ stock: "" })}>×</button></span>}
          <button className="chips__clear" onClick={clearAll}>Clear all</button>
        </div>
      )}

      <div className="shop__body">
        <aside className="shop__aside">{FiltersPanel}</aside>

        <div className="shop__main">
          {pageItems.length === 0 ? (
            <div className="empty">
              <h3>No products found</h3>
              <p>Try adjusting your filters or search terms.</p>
              <button className="btn btn--primary" onClick={clearAll}>Reset filters</button>
            </div>
          ) : (
            <div className={`grid ${view === "list" ? "grid--list" : "grid--3"}`}>
              {pageItems.map((p) => <ProductCard key={p.id} product={p} view={view} />)}
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination">
              <button className="pagination__btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                <IconChevronLeft size={18} />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  className={`pagination__num ${page === i + 1 ? "is-active" : ""}`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button className="pagination__btn" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                <IconChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={`filters-drawer ${filtersOpen ? "is-open" : ""}`}>
        <div className="filters-drawer__overlay" onClick={() => setFiltersOpen(false)} />
        <div className="filters-drawer__panel">{FiltersPanel}</div>
      </div>
    </div>
  );
}
