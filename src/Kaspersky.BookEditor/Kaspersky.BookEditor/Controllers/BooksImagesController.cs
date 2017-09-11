using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Kaspersky.BookEditor.DAL.Models;
using Kaspersky.BookEditor.DAL.Repositories;

namespace Kaspersky.BookEditor.Controllers
{
    public class BooksImagesController : Controller
    {
        private readonly IBooksRepository _booksRepository;

        public BooksImagesController(IBooksRepository booksRepository)
        {
            _booksRepository = booksRepository;
        }

        [HttpGet]
        // GET: booksimages/download/5
        public ActionResult Download(int id)
        {
            var bookImage = _booksRepository.GetAll().FirstOrDefault(i => i.Id == id)?.Image;
            if (bookImage != null)
            {
                return File(bookImage.Content, bookImage.FileType, bookImage.FileName);
            }
            return HttpNotFound("image not found");
        }

        [HttpPost]
        // POST: booksimages/upload/5
        public void Upload(int id)
        {
            var book = _booksRepository.GetAll().FirstOrDefault(i => i.Id == id);
            if (book != null)
            {
                HttpPostedFileBase file = Request.Files[Request.Files.GetKey(0)];

                MemoryStream target = new MemoryStream();
                file.InputStream.CopyTo(target);
                byte[] data = target.ToArray();

                book.Image = new Image {Content = data, FileName = file.FileName, FileType = file.ContentType};
                _booksRepository.AddOrUpdate(book);
            }
        }
    }
}
