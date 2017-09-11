using System.Linq;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.Http.Description;
using System.Web.Http.OData;
using Kaspersky.BookEditor.DAL.Models;
using Kaspersky.BookEditor.DAL.Repositories;
using Kaspersky.BookEditor.ViewModels;

namespace Kaspersky.BookEditor.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class BooksController : ApiController
    {
        private readonly IBooksRepository _booksRepository;
        public BooksController(IBooksRepository booksRepository)
        {
            _booksRepository = booksRepository;
        }

        // GET: api/Books
        [EnableQuery]
        public IQueryable<BookInfo> Get()
        {
            var bookInfo = _booksRepository.GetAll()
                .Select(i => new BookInfo {Id = i.Id, Header = i.Header, Year = i.Year}).ToList();
            return bookInfo.AsQueryable();
        }

        // GET: api/Books/5
        [ResponseType(typeof(Book))]
        public Book Get(int id)
        {
            return _booksRepository.GetAll().FirstOrDefault(i => i.Id == id);
        }

        // POST: api/Books
        [ResponseType(typeof(BookInfo))]
        public IHttpActionResult Post([FromBody] Book book)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _booksRepository.AddOrUpdate(book);
            return Ok(new BookInfo {Id = book.Id, Header = book.Header, Year = book.Year});
        }

        // DELETE: api/Books/5
        [ResponseType(typeof(void))]
        public IHttpActionResult Delete(int id)
        {
            _booksRepository.Delete(id);
            return Ok();
        }
    }
}
