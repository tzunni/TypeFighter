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

    is_book_metadata_field_dict(book, field_name){
        // To Do: Implement detection for array & dictionaries
        return false;
    }

    is_missing_field_data(book){
        return book._is_missing_field_data();
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
        this.key_fields = {}
        this._bibliographic_citation_fields = [] // = this.key_fields as strings
        this._metadata = {};
        this._initialize(book_data);
    }

    _initialize(book_data){
        this._set_key_fields();
        this._set_bcf(book_data);
        this._set_metadata(book_data);
    }

    _set_key_fields(){
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
    }

    _set_bcf(book_data){
        const _field_keys = Object.keys(this.key_fields)
        for (let i = 0; i < _field_keys.length; i++){
            this._bibliographic_citation_fields.push(this.key_fields[_field_keys[i]])
        }
    }

    _set_metadata(book_data){
        for (let i = 0; i < this._bibliographic_citation_fields.length; i++){
            const field_name = this._bibliographic_citation_fields[i]

            if (!(field_name in book_data)){
                this._metadata[field_name] = null;
                continue;
            }

            if (typeof book_data[field_name] === "string"){
                this._metadata[field_name] = book_data[field_name];
                continue;
            }

            if (this._is_nested_dict(book_data, field_name)){
                this._set_metadata_field_inner_dictionary(book_data, field_name);
                continue;
            }

            if (this._is_normal_array(book_data, field_name)){
                this._set_metadata_field_inner_array(book_data, field_name);
            }

            if (this._is_normal_dict(book_data, field_name)){
                this._metadata[field_name] = {};
                this._metadata[field_name] = book_data[field_name];
                continue;
            }
        } // end for
    }

    _is_normal_dict(book_data, field_name){
        return ((typeof book_data[field_name] === "object") && !(Array.isArray(book_data[field_name])));
    }

    _is_normal_array(book_data, field_name){
        const _last_index = book_data[field_name].length - 1;
        return (
            (typeof book_data[field_name][_last_index] === "string") &&
            (Array.isArray(book_data[field_name])) &&
            (typeof book_data[field_name] === "object"))
    }

    _is_nested_dict(book_data, field_name){
        // Intended to only be used in init for _set_metadata
        const _last_index = book_data[field_name].length - 1;
        return (
            (typeof book_data[field_name][_last_index] === "object") &&
            (Array.isArray(book_data[field_name])) &&
            (typeof book_data[field_name] === "object")
        )
    }

    _set_metadata_field_inner_dictionary(book_data, field_name){
        const inner_dict = book_data[field_name][0]; // Assume only one index
        this._metadata[field_name] = {};
        const _inner_dict_keys = Object.keys(inner_dict);
        for (let j = 0; j < _inner_dict_keys.length; j++){
            this._metadata[field_name][_inner_dict_keys[j]] = inner_dict[_inner_dict_keys[j]];
        }
    }

    _set_metadata_field_inner_array(book_data, field_name){
        this._metadata[field_name] = [];
        for (let j = 0; j < book_data[field_name].length; j++){
            this._metadata[field_name][j] = book_data[field_name][j];
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
        return null;
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

    _is_missing_field_data(){
        let is_missing = false;
        for (let i = 0; i < this._bibliographic_citation_fields.length; i++){
             let _field_name = this._bibliographic_citation_fields[i];
             if (!this._metadata[_field_name]){
                 is_missing = true;
                 break;
             }
        }
        return is_missing;
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