// Typing Test Class
import React from 'react';
import ReactDOM from 'react-dom/client';
//import ui_handler from './web_display.js'
import { useState, useEffect } from 'react';

// React Component
function Typing_Test_Root({ updateBookPrompt }){
    const [timer_state, set_timer_state] = useState(0.0); // captures seconds with tfm = 1
    const [isTimerOn, set_timer_on] = useState(false)
    const [book_prompt, set_book_prompt] = useState("NA");
    const [wpm, set_wpm] = useState('?');
    const [accuracy, set_accuracy] = useState('?');
    const [mistakes, set_mistakes] = useState(0);
    const [isPromptMatch, set_match_flag] = useState(false)
    const timer_frequency_modulator = 100; // sampling time = seconds / tfm, ex: 100 = 1ms (0.001 seconds)

    // Call API when root is rendered
    useEffect(() => {
        updateBookPrompt();
    }, [updateBookPrompt]); // Run only on mount via dependency

    useEffect(() => {
        let interval = null;
        if (isTimerOn){
            interval = setInterval(() => {
                set_timer_state((previous_time) => previous_time + 1)
            }, (1000 / timer_frequency_modulator))
            console.log("Timer started!")
        } else {
            clearInterval(interval)
        }
        return () => clearInterval(interval);
    }, [isTimerOn]);

    const start_typing_test = () => {
        set_timer_on(true);
        set_accuracy(0)
    }

    const stop_typing_test = () => {
        set_timer_on(false);
    }

    // Update WPM, only when user input is correct
    function update_wpm(user_input){
        if (timer_state > (2 * timer_frequency_modulator)){
            // Date: 2025-04-27, developer: PTang
            // Goal: convert number_of_words to a relative decimal
            // Why: Prevent Speed/WPM from jumping erratically when taking the typing test, / 0 errors, and INF with low values
            // 1. alternate solution: make timer sample at faster intervals
            // 2. alternate solution: make timer start at 3+ seconds instead of at 1 (>0)
            const input_word_list = user_input.trimEnd().split(" ")
            const prompt_word_list = book_prompt.split(" ")
            const last_word_index = input_word_list.length - 1
            const numerator = (input_word_list[last_word_index].length)
            const denominator = (prompt_word_list[last_word_index].length)
            let last_word_completion_percent = numerator / denominator
            const number_of_words = input_word_list.length + (last_word_completion_percent - 1)

            const minutes_elapsed = Math.round((timer_state / (60 * timer_frequency_modulator)) * 100) / 100
            const new_wpm = Math.floor(number_of_words / minutes_elapsed)
            set_wpm(new_wpm)

            console.log(`\tTimer ${timer_state}, WPM (words/min) ${new_wpm}`)
        }
    }

    function update_score(event) {
        const user_input = event.target.value;

        // Lock Data after a correct prompt, ignore any new typed characters
        if (isPromptMatch){
            return
        }

        // Set book_prompt (run once)
        if (book_prompt == "NA"){
            // To Do: Relocate setting book_prompt from update_score into the API call with useEffect or other...
            const new_book_prompt = document.getElementById("prompt_display_box").innerHTML
            set_book_prompt(new_book_prompt)
            start_typing_test()

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
            console.log("Match!")

            set_match_flag(true)
            update_wpm(user_input)
            stop_typing_test()
            return
        }

        // -> Case: user backtracks
        if (mistakes == 0 && user_input.length == 0){
            set_accuracy(100)
            return
        }

        // -> Case: new character (not match)
        if (!book_prompt.startsWith(user_input)){
            const total_characters = book_prompt.length
            const new_accuracy = Math.floor(100 * total_characters / (total_characters + mistakes + 1))
            set_accuracy(new_accuracy)
            set_mistakes(mistakes + 1)

            console.log("User Input: " + user_input)
            console.log("CI: " + user_input + " | book_prompt: " + book_prompt)
            return
        }

        // Default Case:
        /*
            accuracy: unchanged
            wpm: updated
            input: correct (presumably)
        */

        // Update WPM
        update_wpm(user_input)

        // Console Log: CI & Book_Prompt
        console.log("User Input: " + user_input)
        console.log("CI: " + user_input + " | book_prompt: " + book_prompt)
    }

    return (
    <div className="Typing_Test" id="UI">
        <p id="prompt_display_box"> Typing Prompt Display Here </p>

        <input type="text"
            id="prompt_input_box"
            placeholder="Type the sentence above here."
            onChange={update_score}
        />
        <p>Speed: {wpm}</p>
        <br/>
        <p>Accuracy: {accuracy}</p>
    </div>
    ) // Return HTML tags
}

export default Typing_Test_Root;