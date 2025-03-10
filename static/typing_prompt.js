function get_book_data(){
    let work_id = generate_random_book();
    book_api_call(work_id);
}

async function book_api_call(work_id){
//    const URL = "https://openlibrary.org/books/OL7353617M.json"; # Fantastic Mr. Fox

    const URL = "https://openlibrary.org/books/" + work_id + ".json";

    try{
        const response = await fetch(URL);
        if (!response.ok){
            throw new Error('Response status: ${response.status}');
        }

        const book_data = await response.json();

        title = book_data.title;
        document.getElementById("typing_prompt").innerHTML = title

    } catch(error){
        console.error(error.message);
    }
}

function generate_random_book(){
    // To Do: Generate English books and use a section of text from the book instead of the Title or piece together a sentence using the title and other information (such as Genre)
    let work_id = "OL_M";
    const book_id_length = 7;
    let random_book_id = _generate_random_book_id(book_id_length);
    work_id = work_id.replace("_", random_book_id);
    return work_id
}

function _generate_random_book_id(min, max, id_length){
    let book_id = "";
    console.log("BOOK ID: " + book_id)
    book_id = _generate_random_number(000001, 10000000);
    console.log("BOOK ID: " + book_id)
    return book_id;
}

function _generate_random_number(min, max){
    return Math.floor(Math.random() * (max - min) + min);
}