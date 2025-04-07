// Typing Test Class
// To Do: Implement Typing Test
import React from 'react';
import ReactDOM from 'react-dom/client';
import ui_handler from './web_display.js'
import { useState } from 'react';

// React Component
function Root_App(){
    const [timer_state, set_timer_state] = useState(0.0);
    const [prompt, set_prompt] = useState("NA")
    const [input, set_input] = useState("")

    const update_score = () => {
        set_timer_state(timer_state + 0.1)
        document.getElementById("speed").innerHTML = timer_state
        document.getElementById("accuracy").innerHTML = timer_state
        if (prompt == input){
            document.getElementById("game_status").innerHTML = "Prompt Complete!"
        }
    }

    const update_prompt_display = () => {
        ui_handler.get_book_data('OL7353617M')
    }

    const console_log_data = () => {
        console.log("Timer : " + timer_state)
        console.log("Prompt : " + prompt)
        console.log("Input : " + input)
    }

    return (
    <div>
        <p id="game_status"> React Application :3 </p>
        <button onClick={() => update_prompt_display()}> [Get Book Prompt] </button>
        <p id="prompt_display_box"> Typing Prompt Display Here </p>

        <input type="text"
            id="prompt_input_box"
            placeholder="Type the sentence above here."
            onChange={() => update_score()}
        />
        <p>Speed:</p>
        <p id="speed"></p>
        <br/>
        <p>Accuracy:</p>
        <p id="accuracy"></p>
        <button onClick={() => console_log_data()}> [Console Log Data] </button>
    </div>
    ) // Return HTML tags
}

class Typing_Test{
    constructor(){

    }
}

export default Root_App;