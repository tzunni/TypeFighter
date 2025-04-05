class Search_API{
    constructor(){
        this.URL = {
            URL_PATTERN:"https://openlibrary.org/search.json?title=PROMPT",
            WEB_PREFIX:"https://openlibrary.org/search.json?",
            SAMPLE_URL:"https://openlibrary.org/search.json?title=the+lord+of+the+rings"
        }
        this._search_type = {}
        this._initialize();
    }

    _initialize(){
        this._search_type = {
            TITLE:"title", // As of [Date: 04-03-25], only title is implemented proper
            AUTHOR:"author",
            SUBJECT:"subject",
            PLACE:"place",
            PERSON:"person",
            LANGUAGE:"language",
            PUBLISHER:"publisher"
        }
    }

    sanitize_query(search_query){
        // Regular expression to sanitize query of JS tags
        return search_query.replace(/<[^>]*>/g, '')
    }

    async request_search_result(sanitized_query){
//        const URL = this.URL.WEB_PREFIX + this._search_type.TITLE + "=" + sanitized_query.replace(" ", "+");
        const response_limiter = "&fields=*,availability&limit=1";
        try{
//            const response = await fetch(this.URL.SAMPLE_URL + response_limiter); // During debug & development, set URL = Sample
            const response = await fetch(this.URL.WEB_PREFIX + this._search_type.TITLE + "=" + sanitized_query + response_limiter);
            if (!response.ok){
                throw new Error('Response status:' + response.status);
            }
            return await response.json();
        } catch(error){
            console.error(error.message);
        }
    }
} // End Class (Search_API)
const search_api = new Search_API();
export default search_api;