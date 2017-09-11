using System.Collections.Generic;
using System.Linq;
using Kaspersky.BookEditor.DAL.Models;
using Kaspersky.BookEditor.DAL.Repositories;
using Kaspersky.BookEditor.Services;

namespace Kaspersky.BookEditor.Cache.Decorators
{
    public class BooksCacheDecorator : CacheDecoratorBase, IBooksRepository
    {
        private readonly IBooksRepository _booksRepository;

        public BooksCacheDecorator(ICacheService cacheService, IBooksRepository booksRepository) : base(cacheService)
        {
            _booksRepository = booksRepository;
        }

        public List<Book> GetAll()
        {
            return CacheService.GetOrAdd(CacheKey, () => _booksRepository.GetAll());
        }

        public int AddOrUpdate(Book book)
        {
            _booksRepository.AddOrUpdate(book);

            List<Book> books = new List<Book>();
            if (CacheService.Contains(CacheKey))
            {
                books = CacheService.Get<List<Book>>(CacheKey);
            }

            var index = books.FindIndex(b => b.Id == book.Id);
            if (index != -1)
            {
                if (book.Image == null)
                {
                    book.Image = books[index].Image;
                }
                books[index] = book;
            }
            else
            {
                int lastId = 0;
                if (books.Count > 0)
                {
                    lastId = books.Max(i => i.Id);
                }
                book.Id = lastId + 1;
                books.Add(book);
            }

            CacheService.AddOrUpdate(CacheKey, books);

            return book.Id;
        }

        public void Delete(int bookId)
        {
            _booksRepository.Delete(bookId);

            if (CacheService.Contains(CacheKey))
            {
                var books = CacheService.Get<List<Book>>(CacheKey);
                CacheService.AddOrUpdate(CacheKey, books.Where(b => b.Id != bookId).ToList());
            }
        }
    }
}
