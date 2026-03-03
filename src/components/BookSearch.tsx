import { useState } from 'react'
import { supabase } from '../lib/supabase'

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
  const [message, setMessage] = useState('')

  async function searchBooks() {
    console.log('API Key:', import.meta.env.VITE_GOOGLE_BOOKS_API_KEY)
    if (!query) return
    setLoading(true)

    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10&key=${import.meta.env.VITE_GOOGLE_BOOKS_API_KEY}`
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

  async function addToShelf(book: Book, shelf: string) {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase
      .from('shelf_entries')
      .upsert({
        user_id: user.id,
        book_id: book.id,
        title: book.title,
        authors: book.authors.join(', '),
        thumbnail: book.thumbnail,
        shelf: shelf
      }, {
        onConflict: 'user_id, book_id'
      })

    if (error) {
      setMessage('Something went wrong, please try again')
    } else {
      setMessage(`"${book.title}" added to ${shelf.replace('_', ' ')}!`)
    }
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
      {message && <p style={{ color: 'green' }}>{message}</p>}

      <div>
        {results.map(book => (
          <div key={book.id} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            {book.thumbnail && (
              <img src={book.thumbnail} alt={book.title} style={{ width: '80px' }} />
            )}
            <div>
              <h3>{book.title}</h3>
              <p>{book.authors.join(', ')}</p>
              <button onClick={() => addToShelf(book, 'want_to_read')}>Want to Read</button>
              <button onClick={() => addToShelf(book, 'reading')}>Currently Reading</button>
              <button onClick={() => addToShelf(book, 'read')}>Read</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}