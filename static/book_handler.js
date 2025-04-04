import books_api from "./books_api.js"
import covers_api from "./covers_api.js"
import search_api from "./search_api.js"

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

    /* Note: Hierarchy
        1. UI_Handler(s) - get
        2. Book_Handler - retrieve(api_call.request_funct())
        3a. api_call - request()
        3b. class data - getter
    */
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

    async retrieve_search_result(sanitized_query){
        try{
            const search_result_data = await search_api.request_search_result(sanitized_query);
            console.log("Raw search result data: ");
            console.log(search_result_data);
            let search_result = new Search_Result(search_result_data);
            return (search_result);
        } catch (error){
            console.error(error.message);
        }
    }

    get_book_metadata(book){
        return book.get_metadata();
    }

    get_book_field_names(book){
        return book.get_field_names();
    }

    get_book_field_data(book, field_name){
        return book.get_field_data(field_name);
    }

    get_book_missing_field_names(book){
        return book.get_missing_field_names();
    }

    is_book_metadata_field_dict(book, field_name){
        // To Do: Implement detection for array & dictionaries
        return false;
    }

    is_missing_field_data(book){
        return book.is_missing_field_data();
    }

    print_book_missing_fields(book){
        book.print_missing_fields();
    }

    create_book_cover_URL(book){
        // Hard Coded id_type & cover size for now:
        let book_id_type = book.get_book_id_type();
        let book_cover_size = "LARGE";

        try{
            const book_cover_URL = covers_api.create_book_cover_URL(book, book_id_type, book_cover_size);
            console.log("BOOK COVER URL: " + book_cover_URL)
            book.set_book_cover_URL(book_cover_URL);
        }
        catch (error){ // Some books may not have an image or are missing an ISBN
            console.error(error.message);
        }
    }

    get_book_cover_URL(book){
        return book.get_book_cover_URL();
    }

    get_book_sample_cover_URL(){
        return covers_api.get_sample_cover_URL();
    }

    sanitize_query(raw_search_query){
        return search_api.sanitize_query(raw_search_query);
    }

    get_book_id_type(book){
        return book.get_book_id_type();
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

// Book, Parsed Data from Book_API Call (Private)
class Book{
    constructor(book_data){
        // Simulate enum with dict to ensure proper use of key_fields & prevent programmer error (typos)
        this._key_fields = {}
        this._bibliographic_citation_fields = [] // = this._key_fields as strings
        this._metadata = {};
        this._book_cover_URL = ""
        this._book_id_type = "COVERS"
        this._initialize(book_data);
    }

    _initialize(book_data){
        this._set_key_fields();
        this._set_bcf(book_data);
        this._set_metadata(book_data);
    }

    _set_key_fields(){
        this._key_fields = {
            TITLE:"title",
            ISBN_10:"isbn_10",
            COVERS:"covers",
            BOOK_COVERS:"book_covers",
            BOOK_COVER:"book_cover",
            LANGUAGES:"languages",
            SUBJECTS:"subjects",
            WORKS:"works", // work ID
            IDENTIFIERS:"identifiers", // Bookstores such as goodreads
            AUTHORS:"authors",
            CREATED:"created",
            FIRST_SENTENCE:"first_sentence",
            LATEST_REVISION:"latest_revision",
            PUBLISH_DATE:"publish_date",
            PUBLISH_COUNTRY:"publish_country",
        }
    }

    _set_bcf(book_data){
        const _field_keys = Object.keys(this._key_fields)
        for (let i = 0; i < _field_keys.length; i++){
            this._bibliographic_citation_fields.push(this._key_fields[_field_keys[i]])
        }
    }

    _set_metadata(book_data){
        for (let i = 0; i < this._bibliographic_citation_fields.length; i++){
            const field_name = this._bibliographic_citation_fields[i]

            // Hard Coded Statement: WILL throw two errors if covers is not an attribute due to .length
            if (field_name == "covers"){
                try{
                    this._set_metadata_field_inner_array(book_data, field_name);
                    continue;
                }
                catch (error){
                    console.log("'covers' attribute not located in the API response.")
                    console.error(error.message)
                }
            }

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

    get_metadata(){
        return this._metadata;
    }

    get_field_names(){
        // get bibliographic_citation_fields, may change in the future with a split between "key" and "secondary" data fields
        return this._bibliographic_citation_fields;
    }

    get_field_data(field_name){
        // Object.keys returns an array, "in" operator only works on JSON strings
        if (Object.keys(this._metadata).includes(field_name)){
            return this._metadata[field_name];
        }
        return null;
    }

    get_missing_field_names(){
        let missing_fields = [];

        for (let i = 0; i < this._bibliographic_citation_fields.length; i++){
             let _field_name = this._bibliographic_citation_fields[i];
             if (!this._metadata[_field_name]){
                 missing_fields.push(_field_name);
             }
        }

        return missing_fields;
    }

    is_missing_field_data(){
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

    print_missing_fields(){
        const missing_fields = this.get_missing_field_names()
        if (missing_fields.length == 0){
            console.log("Missing Book Fields: None");
            return;
        }
        else{
            let output_string = missing_fields.join(", ")
            console.log("Missing Book Fields: " + output_string);
        }
    }

    set_book_cover_URL(URL){
        this._book_cover_URL = URL;
    }

    get_book_cover_URL(){
        return this._book_cover_URL;
    }

    get_book_id_type(){
        return this._book_id_type;
    }
} // End Class (Book)

/* Search_Result, Parsed from Search_API Call (Private)
- Similar to Book, but certain fields are coded differently & with different response fields
- May refactor to extend from Book.
-- Consideration: Need a convertor for certain (new) values
-- Convertor{key:works (work_ID), title_sort:title, title_suggest:title}
*/
class Search_Result{
    constructor(search_result_data){
        // Simulate enum with dict to ensure proper use of key_fields & prevent programmer error (typos)
        this._key_fields = {}
        this._bibliographic_citation_fields = [] // = this._key_fields as strings
        this._metadata = {};
        this._field_name_convertor = {
            "key":"works",
            "isbn":"isbn_10"
        }
        this._book_cover_URL = ""
        this._book_id_type = "COVER_I"
        this._initialize(search_result_data);
    }

    _initialize(search_result_data){
        this._set_key_fields();
        this._set_bcf(search_result_data);
        this._set_metadata(search_result_data);
    }

    _set_key_fields(){
        this._key_fields = {
            AUTHOR_NAME: "author_name",
            AUTHOR_ALTERNATIVE_NAME: "author_alternative_name",
            EDITION_KEY: "edition_key",
            ID_AMAZON: "id_amazon",
            ID_GOODREADS: "id_goodreads",
            ID_GOOGLE: "id_google",
            ID_OVERDRIVE: "id_overdrive",
            ID_WIKIDATA: "id_wikidata",
            ID_BETTER_WORLD_BOOKS: "id_better_world_books",
            ID_BODLEIAN_OXFORD_UNIVERSITY: "id_bodleian_oxford_university",
            ID_PAPERBACK_SWAP: "id_paperback_swap",
            ISBN: "isbn",
            KEY: "key", // work ID
            COVER_EDITION_KEY: "cover_edition_key", // work ID where the cover ID is from
            COVER_I: "cover_i", // cover ID, tied to cover_edition_key
            LANGUAGE: "language",
            PUBLISH_DATE: "publish_date",
            RATINGS_AVERAGE: "ratings_average",
            RATINGS_COUNT: "ratings_count",
            RATINGS_COUNT_1: "ratings_count_1",
            RATINGS_COUNT_2: "ratings_count_2",
            RATINGS_COUNT_3: "ratings_count_3",
            RATINGS_COUNT_4: "ratings_count_4",
            RATINGS_COUNT_5: "ratings_count_5",
            NUM_FOUND:"num_found",
            SEED: "seed",
            SUBJECT: "subject",
            TITLE_SORT: "title_sort",
            TITLE_SUGGEST: "title_suggest",
            FIRST_SENTENCE: "first_sentence"
        }
    }

    _set_bcf(search_result_data){
        const _field_keys = Object.keys(this._key_fields)
        for (let i = 0; i < _field_keys.length; i++){
            this._bibliographic_citation_fields.push(this._key_fields[_field_keys[i]])
        }
    }

    _set_metadata(search_result_data){
        const book_data = search_result_data.docs[0]
        console.log("Book Data: ")
        console.log(book_data)
        for (let i = 0; i < this._bibliographic_citation_fields.length; i++){
            const field_name = this._bibliographic_citation_fields[i]
            if (field_name == "cover_i"){
                try{
                    this._metadata[field_name] = book_data[field_name];
                    continue;
                }
                catch (error){
                    console.log("'cover_i' attribute not located in the API response.")
                    console.log(error.message)
                }
            }


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

        // Manually encode for odd behaving values such as (covers from covers_api). Here is num_found (unnested) and ratings values (nested)
        this._metadata["num_found"] = search_result_data["num_found"];
        this._metadata[this._key_fields.RATINGS_AVERAGE] = book_data.ratings_average;
        this._metadata[this._key_fields.RATINGS_COUNT] = book_data.ratings_count;
        this._metadata[this._key_fields.RATINGS_COUNT_1] = book_data.ratings_count_1;
        this._metadata[this._key_fields.RATINGS_COUNT_2] = book_data.ratings_count_2;
        this._metadata[this._key_fields.RATINGS_COUNT_3] = book_data.ratings_count_3;
        this._metadata[this._key_fields.RATINGS_COUNT_4] = book_data.ratings_count_4;
        this._metadata[this._key_fields.RATINGS_COUNT_5] = book_data.ratings_count_5;
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

    get_metadata(){
        return this._metadata;
    }

    get_field_names(){
        // get bibliographic_citation_fields, may change in the future with a split between "key" and "secondary" data fields
        return this._bibliographic_citation_fields;
    }

    get_field_data(field_name){
        // Object.keys returns an array, "in" operator only works on JSON strings
        if (Object.keys(this._metadata).includes(field_name)){
            return this._metadata[field_name];
        }
        return null;
    }

    get_missing_field_names(){
        let missing_fields = [];

        for (let i = 0; i < this._bibliographic_citation_fields.length; i++){
             let _field_name = this._bibliographic_citation_fields[i];
             if (!this._metadata[_field_name]){
                 missing_fields.push(_field_name);
             }
        }

        return missing_fields;
    }

    is_missing_field_data(){
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

    print_missing_fields(){
        const missing_fields = this.get_missing_field_names()
        if (missing_fields.length == 0){
            console.log("Missing Book Fields: None");
            return;
        }
        else{
            let output_string = missing_fields.join(", ")
            console.log("Missing Book Fields: " + output_string);
        }
    }

    set_book_cover_URL(URL){
        this._book_cover_URL = URL;
    }

    get_book_cover_URL(){
        return this._book_cover_URL;
    }

    get_book_id_type(){
        return this._book_id_type;
    }
} // End Class (Search_Result)

// Exports
export default Book_Handler;