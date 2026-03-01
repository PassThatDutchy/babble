import { useState } from 'react'

interface Book {
  id: string
  title: string
  authors: string[]
  thumbnail: string
}

export default function BookSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)

  async function searchBooks() {
    if (!query) return
    setLoading(true)

    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`
    )
    const data = await response.json()

    const books = data.items?.map((item: any) => ({
      id: item.id,
      title: item.volumeInfo.title,
      authors: item.volumeInfo.authors || ['Unknown Author'],
      thumbnail: item.volumeInfo.imageLinks?.thumbnail || ''
    })) || []

    setResults(books)
    setLoading(false)
  }

  return (
    <div>
      <h2>Search Books</h2>

      <input
        type="text"
        placeholder="Search by title or author..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && searchBooks()}
      />
      <button onClick={searchBooks}>Search</button>

      {loading && <p>Searching...</p>}

      <div>
        {results.map(book => (
          <div key={book.id} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            {book.thumbnail && (
              <img src={book.thumbnail} alt={book.title} style={{ width: '80px' }} />
            )}
            <div>
              <h3>{book.title}</h3>
              <p>{book.authors.join(', ')}</p>
              <button>Add to Shelf</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}