// Typing Test Class
// To Do: Implement Typing Test
import React from 'react';
import ReactDOM from 'react-dom/client';
import ui_handler from './web_display.js'
import { useState } from 'react';

// React Component
function Root_App(){
    const [timer_state, set_timer_state] = useState(0.0);
    const [prompt, set_prompt] = useState("NA");
    const [input, set_input] = useState("");
    const [count, set_count] = useState(0);
    const [speed, set_speed] = useState(0);
    const [accuracy, set_accuracy] = useState(0);

    function update_score(event) {
        if (prompt == "NA"){
            set_prompt(document.getElementById("prompt_display_box").innerHTML)
        }

        const current_input = event.target.value; // Get the current input value
        console.log("User Input: " + current_input)
        set_input(current_input);

        // Compare input with the prompt
        const matchCount = current_input.split("").reduce((acc, char, index) => {
            return acc + (char === prompt[index] ? 1 : 0);
        }, 0);

        // Calculate accuracy
        const current_accuracy = (matchCount / prompt.length) * 100;
        set_accuracy(current_accuracy.toFixed(2));

        // Check if the prompt is fully matched
        console.log("CI: " + current_input + " | prompt: " + prompt)
        if (current_input === prompt) {
            console.log("Match!")
        }
    }

    const update_prompt_display = () => {
        ui_handler.get_book_data('OL7353617M')
    }

    const display_counter = () => {
        set_count(count + 1);
    }

    return (
    <div>
        <p id="game_status"> React Application :3 </p>
        <button onClick={() => update_prompt_display()}> [Get Book Prompt] </button>
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