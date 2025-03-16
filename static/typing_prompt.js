class Book_Handler {
    constructor(){
        // Empty
    }

    retrieve_book_data(book_identifier){
        book_api.request_book_data(book_identifier);
    }


} // End Class (Book_Handler)

class Book_API{
    constructor(){
        //    Empty
    }

    async request_book_data(work_id){
    //    const URL = "https://openlibrary.org/books/OL7353617M.json"; # Fantastic Mr. Fox

        const URL = "https://openlibrary.org/books/" + work_id + ".json";

        try{
            const response = await fetch(URL);
            if (!response.ok){
                throw new Error('Response status: ${response.status}');
            }

            const book_data = await response.json();
            document.getElementById("search_result").innerHTML = book_data.title
            // Security Note: Do not RETRIEVE book data from .innerHTML due to inspect element
            // Unable to return the .json object, returns the promise instead. Will need to do front end manipulations in the try statement here for the time being...
                // Also unable to assign those .json.data attributes to a new object and return the new object
            // Instead: -> function_name(book_data.attribute)

        } catch(error){
            console.error(error.message);
        }
    }

    async request_random_book_data(){
        const URL = "https://openlibrary.org/books/" + generate_random_work_id() + ".json";

        try{
            const response = await fetch(URL);
            if (!response.ok){
                throw new Error('Response status: ${response.status}');
            }

            const book_data = await response.json();
            // Data Processing

        } catch(error){
            console.error(error.message);
        }
    }

    generate_random_work_id(){
        let work_id = "OL_M"
        const work_id_range_min = 1;
        const work_id_range_max = 10000000;
        work_id = work_id.replace("_", _generate_work_id_digits(work_id_range_min, work_id_range_max));
        return work_id;
    }

    _generate_work_id_digits(min, max){
        return Math.floor(Math.random() * (max - min) + min);
    }
} // End Class (Book_API)

var book_handler = new Book_Handler();
var book_api = new Book_API();

//document.addEventListener("DOMContentLoaded", create_book_api);