import { CATEGORIES } from '../utils/categories.js'

export default function CategoryPicker({ category, subcategory, onChange }) {
  return (
    <div>
      <div className="cat-grid">
        {Object.entries(CATEGORIES).map(([key, cfg]) => (
          <button
            key={key}
            className={`cat-btn ${category === key ? 'selected' : ''}`}
            style={category === key ? { background: cfg.color } : {}}
            onClick={() => onChange(key, category === key ? subcategory : '')}
          >
            <span className="cat-icon">{cfg.icon}</span>
            <span>{cfg.label}</span>
          </button>
        ))}
      </div>

      {category && (
        <div className="subcat-pills">
          {CATEGORIES[category].subcategories.map(sub => (
            <button
              key={sub}
              className={`subcat-pill ${subcategory === sub ? 'selected' : ''}`}
              style={subcategory === sub
                ? { background: CATEGORIES[category].color, borderColor: CATEGORIES[category].color }
                : {}}
              onClick={() => onChange(category, subcategory === sub ? '' : sub)}
            >
              {sub}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
