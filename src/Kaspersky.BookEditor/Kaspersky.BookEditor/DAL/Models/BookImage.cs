namespace Kaspersky.BookEditor.DAL.Models
{
    public class BookImage
    {
        public string FileType { get; set; }
        public string FileName { get; set; }
        public byte[] Data { get; set; }
    }
}