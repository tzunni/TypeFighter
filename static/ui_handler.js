
// Imports
import Book_Handler from "./books_api.js"

class UI_Handler{
    constructor(){
        this.book_handler = new Book_Handler();

        // Binding pointer to in-class functions => bind to event listener (button click), instead of btn_onclick (global_scope)
        // - Alternative option: rebind ui_handler to be globally scoped with `window.ui_handler = ui_handler()` at class_instantiation
        this.get_random_book_data = this.get_random_book_data.bind(this); // Bind method so `this` points to existing UI_Handler instance
        document.getElementById("btn_get_random_book_call").addEventListener("click", this.get_random_book_data); // this.function.bind(null, *args) if any args

        this.status_colours = {
            GREEN:"#419985",
            RED:"#E53E31"
        }
    }

    async get_random_book_data(){
        try{
            const book = await this.book_handler.retrieve_random_book_data();
            this.update_UI(book);
        } catch (error) {
            console.error(error.message)
        }
    }

    // Security Note: Do not RETRIEVE book data from .innerHTML due to inspect element, only SET
    update_UI(book){
        // <<Development Logging>>
        console.log("Parsed Book Data:")
        console.log(book)
        console.log(this.book_handler.get_book_field_names(book));
        console.log(this.book_handler.get_book_metadata(book));
        this.book_handler.print_book_missing_fields(book);
        console.log("Book Data (Title): " + this.book_handler.get_book_field_data(book, "title"));

        // Update UI (In Progress)
        // To Do: Parser for returned array values (such as languages, works, and identifiers) or built into the books class as a function (returning a string)
        const _missing_field_names = this.book_handler.get_book_missing_field_names(book);
        const _field_names = this.book_handler.get_book_field_names(book);

        let output_string = ""
        if (_missing_field_names.length > 0){
            let error_fields = _missing_field_names.join(", ");
            document.getElementById("status").innerHTML = "Status - Missing the following fields: " + error_fields;
            document.getElementById("status").style.color = this.status_colours.RED;
        }
        else{
            document.getElementById("status").innerHTML = "Status: OK";
            document.getElementById("status").style.color = this.status_colours.GREEN;
        }

        for (let i = 0; i < _field_names.length; i++){
            output_string = output_string + _field_names[i] + ": " + this.book_handler.get_book_field_data(book, _field_names[i]) + "," + "<br />";
        }

        document.getElementById("book_information").innerHTML = output_string;
    }
} // End Class

const ui_handler = new UI_Handler();