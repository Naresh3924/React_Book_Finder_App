import "./styles.css";
import React, { useState, useEffect, useRef } from "react";

export default function App() {
  const COVER_URL = (id, size = "M") =>
    id ? `https://covers.openlibrary.org/b/id/${id}-${size}.jpg` : null;

  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastSearch, setLastSearch] = useState("");
  const debounceRef = useRef(null);

  // Debounced fetch
  useEffect(() => {
    if (!query.trim()) {
      setBooks([]);
      setError("");
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchBooks(query), 500);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const fetchBooks = async (title) => {
    setLoading(true);
    setError("");
    setLastSearch(title);
    try {
      const res = await fetch(
        `https://openlibrary.org/search.json?title=${encodeURIComponent(
          title
        )}&limit=24`
      );
      if (!res.ok) throw new Error("Network error");
      const data = await res.json();

      if (!data.docs.length) {
        setError("No books found.");
        setBooks([]);
        return;
      }

      setBooks(
        data.docs.map((b) => ({
          key: b.key,
          title: b.title,
          author: b.author_name?.join(", ") || "Unknown",
          year: b.first_publish_year || "—",
          cover: COVER_URL(b.cover_i),
        }))
      );
    } catch {
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openBook = (key) =>
    window.open(`https://openlibrary.org${key}`, "_blank");

  return (
    <div className="app-container">
      <h1 className="title">📚 Book Finder</h1>
      <p className="subtitle">
        Search for books by title — powered by Open Library.
      </p>

      {/* Search bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by book title..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            className="clear-btn"
            onClick={() => {
              setQuery("");
              setBooks([]);
              setError("");
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Status */}
      <div className="status">
        {loading && "Loading books..."}
        {!loading && error && <span className="error">{error}</span>}
        {!loading && !error && books.length > 0 && (
          <span>
            Showing {books.length} results for “<strong>{lastSearch}</strong>”
          </span>
        )}
      </div>

      {/* Results */}
      <div className="book-grid">
        {books.map((b) => (
          <div
            key={b.key}
            className="book-card"
            onClick={() => openBook(b.key)}
          >
            {b.cover ? (
              <img src={b.cover} alt={b.title} className="book-cover" />
            ) : (
              <div className="no-cover">No Cover</div>
            )}
            <h3 className="book-title">{b.title}</h3>
            <p className="book-author">{b.author}</p>
            <p className="book-year">{b.year}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="footer">
        Data from{" "}
        <a href="https://openlibrary.org" target="_blank" rel="noreferrer">
          Open Library
        </a>
        . Candidate ID: <strong>Naukri1025</strong>
      </footer>
    </div>
  );
}
