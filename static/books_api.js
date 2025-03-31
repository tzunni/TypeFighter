// Book Data Handler (Public)
class Book_Handler {
    constructor(){
        // Book Cache with Bookshelf (In Progress)
        this._bookshelf = new Bookshelf();
    }

    print_data(){
        console.log("Book handler currently stores no data")
    }

    // Note: an async function must be used to call this
    async retrieve_book_data(book_identifier){
        try{
            const book_data = await books_api.request_book_data(book_identifier);
            let book = new Book(book_data);
            return (book);
        } catch (error){
            // May update front-end elements with (fail) information by returning the error.
            console.error(error.message);
        }
    }

    // Note: an async function must be used to call this
    async retrieve_random_book_data(){
        try{
            const book_data = await books_api.request_random_book_data();
            console.log("Raw book data: ");
            console.log(book_data);
            let book = new Book(book_data);
            return (book);
        } catch (error){
            // May update front-end elements with (fail) information by returning the error.
            console.error(error.message);
        }
    }

    get_book_metadata(book){
        return book._get_metadata();
    }

    get_book_field_names(book){
        return book._get_field_names();
    }

    get_book_field_data(book, field_name){
        return book._get_field_data(field_name);
    }

    get_book_missing_field_names(book){
        return book._get_missing_field_names();
    }

    print_book_missing_fields(book){
        book._print_missing_fields();
    }
} // End Class (Book_Handler)

// Book Collection Cache (Private)
class Bookshelf{
    // Local Book Cache
    constructor(){
        this._books = []
    }

    shelve_books(...incoming_books){
        const num_books = incoming_books.length
        for (let i = 0; i < num_books; i++){
            this._books.push(incoming_books[i])
        }
    }

    get_bookshelf(){
        return this._books;
    }

    // To Do: Functions for parsing multiple books for certain data.
    // Example: get_book_by_title(title), get_book_by_isbn(isbn_10 / isbn_13), get_books_in_language(languages), etc
}

// Book, Parsed Data from API Call (Private)
class Book{
    constructor(book_data){
        // Simulate enum with dict to ensure proper use of key_fields & prevent programmer error (typos)
        this.key_fields = {
            TITLE:"title",
            ISBN_10:"isbn_10",
            LANGUAGES:"languages",
            SUBJECTS:"subjects",
            WORKS:"works",
            IDENTIFIERS:"identifiers",
            AUTHORS:"authors",
            CREATED:"created",
            FIRST_SENTENCE:"first_sentence"
        }
        this._bibliographic_citation_fields = [] // = this.key_fields key strings
        const _field_keys = Object.keys(this.key_fields)
        for (let i = 0; i < _field_keys.length; i++){
            this._bibliographic_citation_fields.push(this.key_fields[_field_keys[i]])
        }

        // Save metadata
        this._metadata = {}
        for (let i = 0; i < this._bibliographic_citation_fields.length; i++){
            if (this._bibliographic_citation_fields[i] in book_data){
                this._metadata[this._bibliographic_citation_fields[i]] = book_data[this._bibliographic_citation_fields[i]];
            }
            else{
                this._metadata[this._bibliographic_citation_fields[i]] = null; // Default: null until decided to be na, empty string, etc
            }
        }
    }

    _get_metadata(){
        return this._metadata;
    }

    _get_field_names(){
        // get bibliographic_citation_fields, may change in the future with a split between "key" and "secondary" data fields
        return this._bibliographic_citation_fields;
    }

    _get_field_data(field_name){
        // Object.keys returns an array, "in" operator only works on JSON strings
        if (Object.keys(this._metadata).includes(field_name)){
            return this._metadata[field_name];
        }
        return "";
    }

    _get_missing_field_names(){
        let missing_fields = [];

        for (let i = 0; i < this._bibliographic_citation_fields.length; i++){
             let _field_name = this._bibliographic_citation_fields[i];
             if (!this._metadata[_field_name]){
                 missing_fields.push(_field_name);
             }
        }

        return missing_fields;
    }

    _print_missing_fields(){
        const missing_fields = this._get_missing_field_names()
        if (missing_fields.length == 0){
            console.log("Missing Book Fields: None");
            return;
        }
        else{
            let output_string = missing_fields.join(", ")
            console.log("Missing Book Fields: " + output_string);
        }
    }
    // To Do: Functions for parsing array fields (such as languages) or having flags denoting those.
}

// API Call Logic (Private)
class Books_API{
    constructor(){
        this.URL = {
            WEB_PREFIX:"https://openlibrary.org/books/",
            JSON_SUFFIX:".json"
        }
    }

    async request_book_data(work_id){
    //    const URL = "https://openlibrary.org/books/OL7353617M.json"; # Fantastic Mr. Fox

        const URL = this.URL.WEB_PREFIX + work_id + this.URL.JSON_SUFFIX;

        try{
            const response = await fetch(URL);
            if (!response.ok){
                throw new Error('Response status:' + response.status);
            }
            return await response.json(); // Note: You cannot return (new_object = object.json) or (new_object = object.json.attribute) since it'll return a promise or fail entirely.

        } catch(error){
            console.error(error.message);
        }
    }

    async request_random_book_data(){
        const URL = this.URL.WEB_PREFIX + this.generate_random_work_id() + this.URL.JSON_SUFFIX;

        try{
            const response = await fetch(URL);
            if (!response.ok){
                throw new Error('Response status:' + response.status);
            }

            return await response.json();

        } catch(error){
            console.error(error.message);
        }
    }

    generate_random_work_id(){
        let work_id = "OL_M"
        const work_id_range_min = 1;
        const work_id_range_max = 10000000;
        work_id = work_id.replace("_", this._generate_work_id_digits(work_id_range_min, work_id_range_max));
        return work_id;
    }

    _generate_work_id_digits(min, max){
        return Math.floor(Math.random() * (max - min) + min);
    }
} // End Class (Books_API)

// Create Classes
const books_api = new Books_API();

// Exports
export default Book_Handler;