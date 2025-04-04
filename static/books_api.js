class Books_API{
    constructor(){
        this.URL = {
            WEB_PREFIX:"https://openlibrary.org/books/",
            JSON_SUFFIX:".json",
            URL_PATTERN:"https://openlibrary.org/books/ID.json",
            SAMPLE_WORK_ID:"OL7353617M", // Fantastic Mr. Fox
            SAMPLE_URL:"https://openlibrary.org/books/OL7353617M.json"
        }
    }

    async request_book_data(work_id){
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

    get_sample_book_URL(){
        return this.URL.SAMPLE_URL;
    }
} // End Class (Books_API)


// Create Classes
const books_api = new Books_API();
export default books_api;