using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Kaspersky.BookEditor.DAL.Attributes;

namespace Kaspersky.BookEditor.DAL.Models
{
    public class Book
    {
        public int Id { get; set; }

        [Required]
        [StringLength(30)]
        public string Header { get; set; }

        [EnsureOneElement]
        public List<Author> Authors { get; set; }

        [Required]
        [Range(1, 10000)]
        public int PageCount { get; set; }
        
        [StringLength(30)]
        public string Publisher { get; set; }

        [MinValue(1800)]
        public int Year { get; set; }

        [Isbn]
        public string Isbn { get; set; }
        public Image Image { get; set; }
    }
}