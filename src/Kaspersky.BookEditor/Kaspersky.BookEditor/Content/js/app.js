$(function () {
    var booksListTemplate = Handlebars.compile($("#books-list-template").html());
    var bookDetailTemplate = Handlebars.compile($("#book-detail-template").html());
    var bookFormTemplate = Handlebars.compile($("#book-form-template").html());
    var booksList;

    var localStorageSortingFieldKey = "ks_t1_sfield";
    var localStorageSortingDirectionKey = "ks_t1_sdirection";
    
    // util functions

    function validateIsbn(isbn) {

        // Checks for ISBN-10 or ISBN-13 format
        var regex =
            /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/;

        if (regex.test(isbn)) {
            // Remove non ISBN digits, then split into an array
            var chars = isbn.replace(/[- ]|^ISBN(?:-1[03])?:?/g, "").split("");
            // Remove the final ISBN digit from `chars`, and assign it to `last`
            var last = chars.pop();
            var sum = 0;
            var check, i;

            if (chars.length === 9) {
                // Compute the ISBN-10 check digit
                chars.reverse();
                for (i = 0; i < chars.length; i++) {
                    sum += (i + 2) * parseInt(chars[i], 10);
                }
                check = 11 - (sum % 11);
                if (check === 10) {
                    check = "X";
                } else if (check === 11) {
                    check = "0";
                }
            } else {
                // Compute the ISBN-13 check digit
                for (i = 0; i < chars.length; i++) {
                    sum += (i % 2 * 2 + 1) * parseInt(chars[i], 10);
                }
                check = 10 - (sum % 10);
                if (check === 10) {
                    check = "0";
                }
            }

            if (String(check) !== last) {
                alert("Invalid ISBN check digit");
                return false;
            }
        } else {
            alert("Invalid ISBN");
            return false;
        }

        return true;
    }
    
    // api
    
    function getBooksData() {

        var d = $.Deferred();

        $.ajax(
            {
                url: '/api/books/',
                type: 'GET'
            }).done(function (data) {
            d.resolve(data);
        }).fail(function (jqXhr, textStatus, errorThrown) {
            d.reject();
            alert("book list loading error: " + textStatus);
        });

        return d;
    }

    function getBook(id) {
        var d = $.Deferred();

        $.ajax(
            {
                url: '/api/books/' + id,
                type: 'GET'
            }).done(function (data) {
            d.resolve(data);
        }).fail(function (jqXhr, textStatus, errorThrown) {
            d.reject();
            alert("book list loading error: " + textStatus);
        });

        return d;
    }

    function deleteBook(id) {
        var d = new $.Deferred();

        $.ajax({
            url: "/api/Books/" + id,
            type: 'DELETE',
            success: function () {
                d.resolve();
            },
            error: function (jqXhr, textStatus, errorThrown) {
                d.reject();
                alert("book save error: " + textStatus);
            }
        });

        return d;
    }
   
    // data submit

    function submitFile(id) {
        var d = new $.Deferred();

        var formData = new FormData($("#book-file-form"));
        var files = document.getElementById('book-image').files;
        if (files.length > 0) {
            formData.append("book-image", files[0]);
            $.ajax({
                url: "/booksimages/upload/" + id,
                type: 'POST',
                data: formData,
                cache: false,
                processData: false,
                contentType: false
            }).done(function () {
                d.resolve();
            }).fail(function (jqXhr, textStatus, errorThrown) {
                d.reject();
                alert("book save error: " + textStatus);
            });
        } else {
            d.resolve();
        }

        return d;
    }

    function submitForm() {
        var d = new $.Deferred();

        $.ajax({
            type: "POST",
            url: "/api/books",
            data: $('#book-form').serialize()
        }).done(function (bookInfo) {
            d.resolve(bookInfo);
        }).fail(function (jqXhr, textStatus, errorThrown) {
            d.reject();
            alert("book save error: " + textStatus);
        });

        return d;
    }
    
    // data setup

    function setBooksListGlobal() {
        var d = new $.Deferred();

        $.when(getBooksData()).then(function (books) {
            booksList = books;
            d.resolve(books);
        });

        return d;
    }

    // data manipulation

    function sortDesc(field) {
        if (field === "year") {
            booksList = booksList.sort(function (a, b) {
                return a[field] - b[field];
            });
        } else {
            booksList = booksList.sort(function (a, b) {
                if (a[field] < b[field])
                    return -1;
                if (a[field] > b[field])
                    return 1;
                return 0;
            });
        }
        $(".books-list").html(booksListTemplate({ books: booksList }));

        localStorage.setItem(localStorageSortingFieldKey, field);
        localStorage.setItem(localStorageSortingDirectionKey, "desc");
    }

    function sortAsc(field) {
        if (field === "year") {
            booksList = booksList.sort(function (a, b) {
                return b[field] - a[field];
            });
        } else {
            booksList = booksList.sort(function (a, b) {
                if (a[field] > b[field])
                    return -1;
                if (a[field] < b[field])
                    return 1;
                return 0;
            });
        }
        $(".books-list").html(booksListTemplate({ books: booksList }));

        localStorage.setItem(localStorageSortingFieldKey, field);
        localStorage.setItem(localStorageSortingDirectionKey, "asc");
    }

    function rearrangeAuthorsIndexes() {
        $("input[name$='.FirstName']").each(function (index) {
            $(this).attr('name', "Authors[" + index + "].FirstName");
        });
        $("input[name$='.LastName']").each(function (index) {
            $(this).attr('name', "Authors[" + index + "].LastName");
        });
    }

    // handlers

    function setupSortButtons() {
        $("#sort-desc").click(function () {
            var field = $("#sorting-select").val();
            sortDesc(field);
        });

        $("#sort-asc").click(function () {
            var field = $("#sorting-select").val();
            sortAsc(field);
        });
    }

    function setupSaveButton() {
        $("#save-book").click(function () {

            $.validate({
                borderColorOnError: 'inherit',
                addValidClassOnAll: true
            });

            $("#book-form input").validate();

            if ($("#book-form input.error").length === 0) {
                if (validateIsbn($("#book-form input[name='Isbn']").val())) {
                    $.when(submitForm()).then(function (bookInfo) {
                        $.when(submitFile(bookInfo.id)).then(function () {
                            var bookIndex;

                            document.location.hash = bookInfo.id;

                            if (booksList.some(function (element, index) {
                                if (element.id === bookInfo.id) {
                                    bookIndex = index;
                                    return true;
                                }
                                return false;

                            })) {
                                booksList[bookIndex] = bookInfo;
                            } else {
                                booksList.push(bookInfo);
                            }
                            renderBooksList(booksList);
                        });
                    });
                }
            }
        });
    }

    function setupCancelButton() {
        $("#close-form-book").click(function () {
            document.location.hash = "";
        });
    }

    function setupFormSectionAddButton() {
        $(".form-section-add").click(function () {
            $(
                '<div class="panel panel-default">' +
                '<div class="panel-body">' +
                '<p>' +
                'Имя:' +
                '<input type="text" name="Authors[0].FirstName" value="" />' +
                '</p>' +
                '<p>' +
                'Фамилия:' +
                '<input type="text" name="Authors[0].LastName" value="" />' +
                '</p>' +
                '<button class="form-section-delete" type="button">Удалить</button>' +
                '</div>' +
                '</div>').insertBefore($(this));
            rearrangeAuthorsIndexes();
            setupFormSectionDeleteButton();
        });
    }

    function setupFormSectionDeleteButton() {
        $(".form-section-delete").off();
        $(".form-section-delete").click(function () {
            if ($(this).parent().parent().parent().children(".panel").length !== 1) {
                $(this).parent().parent().remove();
                rearrangeAuthorsIndexes();
            } else {
                alert("У книги должен быть хотя бы один автор");
            }
        });
    }

    function setupDeleteButton(id) {
        $("#delete-book").click(function () {
            $.when(deleteBook(id)).then(function() {
                var bookIndex;

                document.location.hash = "";

                if (booksList.some(function (element, index) {
                    if (element.id === Number(id)) {
                        bookIndex = index;
                        return true;
                    }
                    return false;

                })) {
                    booksList.splice(bookIndex, 1);
                    renderBooksList(booksList);
                }
            });
        });
    }

    // render
    
    function renderBooksList(books) {

        var field = localStorage.getItem(localStorageSortingFieldKey);
        var direction = localStorage.getItem(localStorageSortingDirectionKey);
        if (direction === "asc") {
            sortAsc(field);
        } else if (direction === "desc") {
            sortDesc(field);
        } else {
            $(".books-list").html(booksListTemplate({ books: books }));
        }

        $(".books-list").show();
        setupSortButtons();
    }
    
    function renderPage() {
        var id;

        function renderEditPage(book) {
            // check if boo exists for current route hash
            if (book) {
                $(".book-detail-wrapper").hide();
                $(".book-form-wrapper").html(bookFormTemplate(book));

                setupSaveButton();
                setupCancelButton();
                setupFormSectionDeleteButton();
                setupFormSectionAddButton();

                $(".book-form-wrapper").show();
            } else {
                // if not, return to home
                document.location.hash = "";
            }
        }

        if (/^#\d*$/.test(window.location.hash)) {
            id = window.location.hash.slice(1);
            $.when(getBook(id)).then(function (book) {
                $(".book-form-wrapper").hide();

                $(".book-detail-wrapper").html(bookDetailTemplate(book));

                setupDeleteButton(id);

                if (book.image && book.image.fileType && book.image.content) {
                    $("#book-img").attr("src", "data:" + book.image.fileType + ";base64," + book.image.content);
                    $(".book-image").show();
                }

                $(".book-detail-wrapper").show();
            });
        } else if (/^#\d*\/edit$/.test(window.location.hash)) {
            id = window.location.hash.split('/')[0].slice(1);
            $.when(getBook(id)).then(renderEditPage);
        } else if (/^#add$/.test(window.location.hash)) {
            renderEditPage({
                authors: [
                    {
                        firstName: "",
                        secondName: ""
                    }
                ]
            });
        } else {
            $(".book-detail-wrapper").hide();
            $(".book-form-wrapper").hide();
        }
    }

    $(window).on('hashchange', renderPage);

    $.when(setBooksListGlobal()).then(function (books) {
        renderBooksList(books);
    });
    renderPage();
});
