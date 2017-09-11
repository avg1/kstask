using System;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.RegularExpressions;

namespace Kaspersky.BookEditor.DAL.Attributes
{
    public class IsbnAttribute : ValidationAttribute
    {
        private bool validateIsbn(string isbn)
        {
            Regex rgx = new Regex(@"^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$");

            if (rgx.IsMatch(isbn))
            {
                rgx = new Regex("[- ]|^ISBN(?:-1[03])?:?");

                char[] chars = rgx.Replace(isbn, "").ToCharArray();

                char last = chars[chars.Length - 1];
                chars = chars.Take(chars.Length - 1).ToArray();

                int sum = 0;
                int check;
                string checkSum;

                if (chars.Length == 9)
                {
                    // Compute the ISBN-10 check digit
                    chars = chars.Reverse().ToArray();
                    for (int i = 0; i < chars.Length; i++)
                    {
                        sum += (i + 2) * (int)Char.GetNumericValue(chars[i]);
                    }
                    check = 11 - (sum % 11);
                    if (check == 10)
                    {
                        checkSum = "X";
                    }
                    else if (check == 11)
                    {
                        checkSum = "0";
                    }
                    else
                    {
                        checkSum = check.ToString();
                    }
                }
                else
                {
                    // Compute the ISBN-13 check digit
                    for (int i = 0; i < chars.Length; i++)
                    {
                        sum += (i % 2 * 2 + 1) * (int)Char.GetNumericValue(chars[i]);
                    }
                    check = 10 - (sum % 10);
                    checkSum = check == 10 ? "0" : check.ToString();
                }

                if (checkSum == Convert.ToString(last))
                {
                    return true;
                }
            }

            return false;
        }
        public override bool IsValid(object value)
        {
            return validateIsbn((string)value);
        }
    }
}