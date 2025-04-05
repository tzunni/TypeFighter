class Covers_API{
    constructor(){
        this.URL = {
            WEB_PREFIX:"https://covers.openlibrary.org/b/",
            FILE_SUFFIX:".jpg",
            URL_PATTERN:"https://covers.openlibrary.org/b/KEY/VALUE-SIZE.jpg",
            SAMPLE_URL:"https://covers.openlibrary.org/b/id/8510350-L.jpg"
        }
        this._valid_cover_keys = {}
        this._cover_key_types = []
        this._cover_sizes = {}
        this._initialize()
    }

    _initialize(){
        this._set_valid_cover_keys();
        this._set_cover_key_types();
        this._set_cover_sizes();
    }

    _set_valid_cover_keys(){
        // API says that all of these are valid, however testing seems to show only covers id is valid
        this._valid_cover_keys = {
            ISBN_10:"isbn",
            ISBN_13:"isbn",
            OCLC:"oclc",
            LCNN:"lcnn",
            OLID:"olid", // work ID
            ID:"id",
            COVERS:"id", // REQUIRED: DO NOT REMOVE
            COVER_I:"id" // REQUIRED: DO NOT REMOVE
        }
    }

    _set_cover_key_types(){
        const _key_types = Object.keys(this._valid_cover_keys)
        for (let i = 0; i < _key_types.length; i++){
            this._cover_key_types.push(this._valid_cover_keys[_key_types[i]])
        }
    }

    _set_cover_sizes(){
        this._cover_sizes = {
            SMALL:"S",
            MEDIUM:"M",
            LARGE:"L"
        }
    }

    async request_cover_metadata(book_cover_URL){
        const URL = book_cover_URL.replace(".jpg", ".json")

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

    get_cover_key_types(){
        return this._cover_key_types;
    }

    get_sample_cover_URL(){
        return this.URL.SAMPLE_URL;
    }

    create_book_cover_URL(book, book_id_type, cover_size){
        let book_cover_URL = this.URL.URL_PATTERN;
//        const _book_id_type_to_book_id_metadata_field_key_convertor = {
//            "COVERS":"covers",
//            "COVER_I":"covers_i"
//        }

        const cover_key = this._valid_cover_keys[book_id_type]; // book uses work_id (from books_api) where covers_api needs the string "id"
//        const _book_id_metadata_field_key = _book_id_type_to_book_id_metadata_field_key_convertor[book_id_type];
        let value = book.get_field_data(book_id_type.toLowerCase()); // metadata fields are in the lower case
        const size = this._cover_sizes[cover_size];

        try{
            // covers field may be an array with multiple values
            if (value !== null && value.length > 1){
                value = value[0];
            }
        }
        catch (error){
            console.error(error.message)
        }

        console.log("Get Book Cover URL Components:")
        console.log("ID Type: " + cover_key)
        console.log("ID Value: " + value)
        console.log("Cover Size (Abbrv): " + size)

        if (!cover_key){
            console.log("Error: Invalid book type");
            return ""
        }
        if (!value){
            console.log("Error: Book is missing a cover");
            return ""
        }
        if (!size){
            console.log("Error: Invalid cover size given");
            return ""
        }

        if (cover_key && value && size){
            book_cover_URL = book_cover_URL.replace("KEY", cover_key);
            book_cover_URL = book_cover_URL.replace("VALUE", value);
            book_cover_URL = book_cover_URL.replace("SIZE", size);
            return book_cover_URL;
        }
    }
} // End Class (Covers_API)

const covers_api = new Covers_API();
export default covers_api;