using System.Collections.Generic;
using Kaspersky.BookEditor.DAL.Models;

namespace Kaspersky.BookEditor.DAL.Repositories
{
    public interface IBooksRepository
    {
        List<Book> GetAll();
        int AddOrUpdate(Book book);
        void Delete(int bookId);
    }
}
