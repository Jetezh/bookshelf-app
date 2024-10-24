// Konstanta penyimpanan lokal
const STORAGE_KEY = 'bookshelf_app';
const SAVED_EVENT = 'saved_books';
const RENDER_EVENT = 'render_books';

// Array books untuk menyimpan objek buku
let books = [];
let editedBookId = null; // Untuk menyimpan ID buku yang sedang diedit

// Cek apakah browser mendukung localstorege ada
const isStorageExist = () => {
  return typeof Storage !== 'undefined';
};

// Menghasilkan ID unik untuk buku
const generateId = () => {
  return +new Date();
};

// Menemukan indeks buku berdasarkan ID
const findBookIndex = (bookId) => {
  return books.findIndex((book) => book.id == bookId);
};

// Menemukan buku tertentu berdasarkan ID
const findBook = (bookId) => {
  return books.find((book) => book.id == bookId);
};

// Menghasilkan objek buku
const generateBookObject = (id, title, author, year, isComplete) => {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
};

// Simpan data ke localStorage
const saveData = () => {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
};

// Memuat data dari localStorage
const loadDataFromLocalStorage = () => {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  if (serializedData !== null) {
    books = JSON.parse(serializedData).map((book) => ({
      ...book,
      year: Number(book.year),
      isComplete: book.isComplete ?? false
    }));
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
};

// Tambahkan buku baru
const addBook = (title, author, year, isComplete) => {
  const bookId = generateId();
  const bookObject = generateBookObject(bookId, title, author, Number(year), isComplete);
  books.push(bookObject);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};

// Perbarui buku (mode edit)
const updateBook = (id, title, author, year, isComplete) => {
  const bookIndex = findBookIndex(id);
  if (bookIndex !== -1) {
    books[bookIndex].title = title;
    books[bookIndex].author = author;
    books[bookIndex].year = year;
    books[bookIndex].isComplete = isComplete;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }
};

// Hapus buku
const deleteBook = (bookId) => {
  const bookIndex = findBookIndex(bookId);
  if (bookIndex !== -1) {
    books.splice(bookIndex, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }
};

// Alihkan status penyelesaian buku
const toggleBookCompletion = (bookId) => {
  const book = findBook(bookId);
  if (book) {
    book.isComplete = !book.isComplete;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }
};

// Mengubah informasi buku
const editBook = (bookId) => {
  const book = findBook(bookId);
  if (book) {
    document.getElementById('bookFormTitle').value = book.title;
    document.getElementById('bookFormAuthor').value = book.author;
    document.getElementById('bookFormYear').value = book.year;
    document.getElementById('bookFormIsComplete').checked = book.isComplete;
    editedBookId = bookId;
    
    // Ubah h2 menjadi "Edit Buku" saat mode edit aktif
    document.querySelector('.addbook-container h2').innerText = 'Edit Buku';
  }
};

// Fungsi untuk mencari buku berdasarkan judul dan menampilkan yang relevan
const searchBooks = (keyword) => {
  const searchKeyword = keyword.toLowerCase();
  books.forEach((book) => {
    const bookElement = document.querySelector(`[data-bookid="${book.id}"]`);
    if (book.title.toLowerCase().includes(searchKeyword)) {
      bookElement.style.display = '';  // Tampilkan jika cocok
    } else {
      bookElement.style.display = 'none';  // Sembunyikan jika tidak cocok
    }
  });
};

// Event listener untuk form pencarian
const searchForm = document.getElementById('searchBook');
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const searchKeyword = document.getElementById('searchBookTitle').value;
  searchBooks(searchKeyword);
});

// Render buku
const renderBooks = () => {
  const incompleteBookList = document.getElementById('incompleteBookList');
  const completeBookList = document.getElementById('completeBookList');

  incompleteBookList.innerHTML = '';
  completeBookList.innerHTML = '';

  books.forEach((book) => {
    const bookItem = document.createElement('div');
    bookItem.classList.add('book-card');
    bookItem.dataset.bookid = book.id;
    bookItem.setAttribute('data-testid', 'bookItem');

    const bookTitle = document.createElement('h3');
    bookTitle.classList.add('book-title');
    bookTitle.innerText = book.title;
    bookTitle.setAttribute('data-testid', 'bookItemTitle');
    bookItem.appendChild(bookTitle);

    const bookAuthor = document.createElement('p');
    bookAuthor.classList.add('book-author');
    bookAuthor.innerText = `Penulis: ${book.author}`;
    bookAuthor.setAttribute('data-testid', 'bookItemAuthor');
    bookItem.appendChild(bookAuthor);

    const bookYear = document.createElement('p');
    bookYear.classList.add('book-year')
    bookYear.innerText = `Tahun: ${book.year}`;
    bookYear.setAttribute('data-testid', 'bookItemYear');
    bookItem.appendChild(bookYear);

    const buttonsContainer = document.createElement('div');

    // Tombol alihkan status penyelesaian
    const toggleButton = document.createElement('button');
    toggleButton.innerText = book.isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca';
    toggleButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
    toggleButton.addEventListener('click', () => toggleBookCompletion(book.id));
    buttonsContainer.appendChild(toggleButton);

    // Tombol hapus buku
    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'Hapus Buku';
    deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
    deleteButton.addEventListener('click', () => deleteBook(book.id));
    buttonsContainer.appendChild(deleteButton);

    // Tombol edit buku
    const editButton = document.createElement('button');
    editButton.innerText = 'Edit Buku';
    editButton.setAttribute('data-testid', 'bookItemEditButton');
    editButton.addEventListener('click', () => editBook(book.id));
    buttonsContainer.appendChild(editButton);

    bookItem.appendChild(buttonsContainer);

    if (book.isComplete) {
      completeBookList.appendChild(bookItem);
    } else {
      incompleteBookList.appendChild(bookItem);
    }
  });
};

// Event listener untuk pengiriman form (reset judul jika mode edit selesai)
document.addEventListener('DOMContentLoaded', () => {
  const bookForm = document.getElementById('bookForm');
  bookForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('bookFormTitle').value;
    const author = document.getElementById('bookFormAuthor').value;
    const year = document.getElementById('bookFormYear').value;
    const isComplete = document.getElementById('bookFormIsComplete').checked;

    if (editedBookId) {
      updateBook(editedBookId, title, author, year, isComplete);
      editedBookId = null;

      // Kembalikan h2 ke "Tambah Buku Baru" setelah mode edit selesai
      document.querySelector('.addbook-container h2').innerText = 'Tambah Buku Baru';
    } else {
      addBook(title, author, year, isComplete);
    }

    bookForm.reset();
  });

  if (isStorageExist()) {
    loadDataFromLocalStorage();
  }
});

// Event listener untuk render
document.addEventListener(RENDER_EVENT, () => {
  renderBooks();
});