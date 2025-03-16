class Book_Handler {
    constructor(){
        // Empty
    }

    async retrieve_book_data(book_identifier){
        try{
            const book_data = await book_api.request_book_data(book_identifier);
            // Processing data goes here.
            this.update_UI(book_data);
        } catch (error){
            // May update front-end elements with (fail) information.
            console.error(error.message);
        }
    }

    update_UI(book_data){
        // Security Note: Do not RETRIEVE book data from .innerHTML due to inspect element
        document.getElementById("search_result").innerHTML = book_data.title;
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
                throw new Error('Response status:' + response.status);
            }
            return await response.json(); // Note: You cannot return (new_object = object.json) or (new_object = object.json.attribute) since it'll return a promise or fail entirely.

        } catch(error){
            console.error(error.message);
        }
    }

    async request_random_book_data(){
        const URL = "https://openlibrary.org/books/" + generate_random_work_id() + ".json";

        try{
            const response = await fetch(URL);
            if (!response.ok){
                throw new Error('Response status:' + response.status);
            }

            return await response.json();
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