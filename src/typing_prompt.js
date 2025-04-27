// Typing Test Class
// To Do: Implement Typing Test
import React from 'react';
import ReactDOM from 'react-dom/client';
import ui_handler from './web_display.js'
import { useState } from 'react';

// React Component
function Root_App(){
    const [timer_state, set_timer_state] = useState(0.0);
    const [book_prompt, set_book_prompt] = useState("NA");
    const [count, set_count] = useState(0);
    const [speed, set_speed] = useState(0);
    const [accuracy, set_accuracy] = useState(0);
    const [mistakes, set_mistakes] = useState(0);
    const [isPromptMatch, set_match_flag] = useState(0)

    function update_score(event) {
        const user_input = event.target.value;

        // Lock Data after a correct prompt, ignore any new typed characters
        if (isPromptMatch){
            return
        }

        // Set book_prompt
        if (book_prompt == "NA"){
            const new_book_prompt = document.getElementById("prompt_display_box").innerHTML
            set_book_prompt(new_book_prompt)

            // Calculate accuracy
            if (user_input.length == 1){
                if (new_book_prompt[0] == user_input){
                    set_accuracy(100)
                }
                else {
                    const total_characters = book_prompt.length
                    const new_accuracy = Math.floor(100 * total_characters / (total_characters + mistakes + 1))
                    set_accuracy(new_accuracy)
                    set_mistakes(mistakes + 1)
                }
            }
            else{
                set_accuracy(0)
            }
            return
        }

        // Calculate Accuracy
        // -> Check win before calculating accuracy
        if (user_input == book_prompt){
            document.getElementById("prompt_display_box").style.color = "green"
            set_match_flag(true)
            console.log("Match!")
            return
        }

        // -> Case: user backtracks
        if (mistakes == 0 && user_input.length == 0){
            set_accuracy(100)
            return
        }

        // -> Case: new character
        if (!book_prompt.startsWith(user_input)){
            const total_characters = book_prompt.length
            const new_accuracy = Math.floor(100 * total_characters / (total_characters + mistakes + 1))
            set_accuracy(new_accuracy)
            set_mistakes(mistakes + 1)
        }

        // Console Log: CI & Book_Prompt
        console.log("User Input: " + user_input)
        console.log("CI: " + user_input + " | book_prompt: " + book_prompt)
    }

    const update_book_prompt_display = () => {
        ui_handler.get_book_data('OL7353617M')
    }

    const display_counter = () => {
        set_count(count + 1);
    }

    return (
    <div>
        <p id="game_status"> React Application :3 </p>
        <button onClick={() => update_book_prompt_display()}> [Get Book Prompt] </button>
        <p id="prompt_display_box"> Typing Prompt Display Here </p>

        <input type="text"
            id="prompt_input_box"
            placeholder="Type the sentence above here."
            onChange={update_score}
        />
        <p>Speed: {speed}</p>
        <br/>
        <p>Accuracy: {accuracy}</p>
        <button onClick={() => display_counter()}> [Counter]: {count} </button>
    </div>
    ) // Return HTML tags
}

export default Root_App;