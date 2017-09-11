namespace Kaspersky.BookEditor.DAL.Models
{
    public class Image
    {
        public string FileName { get; set; }
        public string FileType { get; set; }
        public byte[] Content { get; set; }
    }
}