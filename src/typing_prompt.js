// Typing Test Class
import React from 'react';
import ReactDOM from 'react-dom/client';
//import ui_handler from './web_display.js'
import { useState, useEffect } from 'react';

// React Component
function Typing_Test_Root({ update_book_prompt, route_home, promptId, source, onTestComplete }) {
    const [page_state, set_page_state] = useState("typing_test");
    const valid_states = ["typing_test", "results"];
    let current_page;

    const [timer_state, set_timer_state] = useState(0.0); // captures seconds with tfm = 1
    const [isTimerOn, set_timer_on] = useState(false);
    const [total_seconds_elapsed, set_total_seconds_elapsed] = useState(0.0);
    const [book_prompt, set_book_prompt] = useState("NA");
    const [wpm, set_wpm] = useState('?');
    const [accuracy, set_accuracy] = useState('?');
    const [mistakes, set_mistakes] = useState(0);
    const [isPromptMatch, set_match_flag] = useState(false);
    const base_sampling_rate = 1000; // sampling time = 1000 ms (1 sec)
    const timer_frequency_modulator = 100; // divide sampling time by tfm, ex: with tfm 100 => sampling time of 1ms (0.001 seconds)

    // Call API when root is rendered
    useEffect(() => {

    }, [update_book_prompt]); // Run only on mount via dependency
    // Error => Seems to be calling API multiple times (3x consistently)

    useEffect(() => {
        let interval = null;
        if (isTimerOn) {
            interval = setInterval(() => {
                set_timer_state((previous_time) => previous_time + 1)
            }, (base_sampling_rate / timer_frequency_modulator)) // 1000 ms / tfm value
            console.log("Timer started!")
        } else {
            update_total_seconds_elapsed(timer_state) // Save total time elapsed before timer object is deleted
            clearInterval(interval);
        }
        return () => {
            if (interval) { clearInterval(interval); }
        };
    }, [isTimerOn]);

    // State Handler
    switch (page_state) {
        case "typing_test":
            current_page = (
                <div>
                    <p id="prompt_display_box"> Loading Prompt... </p>

                    <input type="text"
                        id="prompt_input_box"
                        placeholder="Type the prompt displayed here."
                        onChange={update_score}
                        onPaste={(e) => e.preventDefault()}
                    />
                    <p>Speed: {wpm}</p>
                </div>
            );
            break
        case "results":
            current_page = (
                <div>
                    <p>Total Time Elapsed: {total_seconds_elapsed} seconds</p>
                    <p>Final WPM: {wpm}</p>
                    <p>Accuracy: {accuracy}%</p>
                    <p>Total Mistakes: {mistakes} incorrect characters</p>
                    <p>Prompt: {source}</p>
                    <button onClick={retake_test}>Retake Test</button>
                    <button onClick={route_home}>Return Home</button>
                </div>
            );
            break;

        default:
            current_page = <div>Page not found!</div>
            break;
    }

    return (
        <div className="Typing_Test">
            {current_page}
        </div>
    ); // Return HTML tags

    function start_typing_test() {
        set_timer_on(true);
        set_accuracy(0)
    }

    function stop_typing_test() {
        set_timer_on(false);
        set_page_state("results");

        // Get the latest accuracy value
        const finalAccuracy = accuracy; // Use the current accuracy state

        // Check if the user is logged in
        fetch('/session', { method: 'GET' })
            .then(response => response.json())
            .then(async (session) => {
                if (session.logged_in) {
                    const userId = session.user_id; // Retrieve user ID from session
                    await uploadRunStats(userId, wpm, finalAccuracy, promptId); // Pass the final accuracy directly

                    // Attack the boss with the player's WPM
                    const updatedBoss = await attackBoss(wpm);
                    console.log('Boss updated after attack:', updatedBoss);
                    onTestComplete(wpm); // Call the function passed from the home page
                } else {
                    console.log('User is not logged in. Stats will not be uploaded.');
                }
            })
            .catch(error => console.error('Error checking session:', error));
    }

    // Update WPM, only when user input is correct
    function update_wpm(user_input) {
        if (timer_state > (2 * timer_frequency_modulator)) {
            const input_word_list = user_input.trimEnd().split(" ")
            const prompt_word_list = book_prompt.split(" ")
            const last_word_index = input_word_list.length - 1
            const numerator = (input_word_list[last_word_index].length)
            const denominator = (prompt_word_list[last_word_index].length)
            let last_word_completion_percent = numerator / denominator
            const number_of_words = input_word_list.length + (last_word_completion_percent - 1)

            const minutes_elapsed = convert_current_timer_to_minutes_elapsed(timer_state);
            const new_wpm = Math.floor(number_of_words / minutes_elapsed)
            set_wpm(new_wpm)

            console.log(`\tRaw Timer Value: ${timer_state} (Minutes Elapsed: ${minutes_elapsed}), WPM: (words/min) ${new_wpm}`)
        }
    }

    function update_score(event) {
        const user_input = event.target.value;

        // Lock Data after a correct prompt, ignore any new typed characters
        if (isPromptMatch) {
            return
        }

        // Set book_prompt (run once)
        if (book_prompt == "NA") {
            // To Do: Relocate setting book_prompt from update_score into the API call with useEffect or other...
            const new_book_prompt = document.getElementById("prompt_display_box").innerHTML
            set_book_prompt(new_book_prompt)
            start_typing_test()

            // Calculate accuracy
            if (user_input.length == 1) {
                if (new_book_prompt[0] == user_input) {
                    set_accuracy(100)
                }
                else {
                    const total_characters = book_prompt.length
                    const new_accuracy = Math.floor(100 * total_characters / (total_characters + mistakes + 1))
                    set_accuracy(new_accuracy)
                    set_mistakes(mistakes + 1)
                }
            }
            else {
                set_accuracy(0)
            }
            return
        }

        // Calculate Accuracy
        // -> Check win before calculating accuracy
        if (user_input == book_prompt) {
            document.getElementById("prompt_display_box").style.color = "green"
            console.log("Match!")

            set_match_flag(true)
            update_wpm(user_input)
            stop_typing_test()
            return
        }

        // -> Case: user backtracks
        if (mistakes == 0 && user_input.length == 0) {
            set_accuracy(100)
            return
        }

        // -> Case: new character (not match)
        if (!book_prompt.startsWith(user_input)) {
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

    function convert_current_timer_to_minutes_elapsed(timer_state) {
        // Note: Do not use for "real measurements" since 60 seconds in a minute make calculations difficult / prone to error
        const _initial_rounding_decimal_places = 3
        let _rounding_constant = 10 ** (_initial_rounding_decimal_places)
        const minutes_elapsed = Math.round((timer_state / (60 * timer_frequency_modulator)) * _rounding_constant) / _rounding_constant // Round to THREE Decimal places
        return minutes_elapsed;
    }

    function update_total_seconds_elapsed(timer_state) {
        // Note: conversion exists due to base 60 unit of time for minutes vs the base 10 standard for seconds/ms with the base_sampling_rate and tfm
        let total_ms_elapsed = timer_state * (base_sampling_rate / timer_frequency_modulator); // ms = samples * sampling ratio
        let total_seconds_passed = Number(total_ms_elapsed / 1000).toFixed(2);
        set_total_seconds_elapsed(total_seconds_passed);
    }

    function retake_test() {
        reset_states()
        set_page_state("typing_test")
        update_book_prompt()
    }

    function reset_states() {
        set_total_seconds_elapsed(0.0)
        set_book_prompt("NA")
        set_wpm('?')
        set_accuracy('?')
        set_mistakes(0)
        set_match_flag(false)
    }

    async function uploadRunStats(userId, wpm, accuracy, promptId) {
        try {
            const runData = {
                user_id: userId,
                wpm: wpm,
                accuracy: accuracy,
                prompt_id: promptId,
                run_time: new Date().toISOString()
            };

            console.log('Uploading run stats:', runData); // Debugging log

            const response = await fetch('/runs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(runData)
            });

            const result = await response.json();
            if (response.ok) {
                console.log('Run uploaded successfully:', result);
            } else {
                console.error('Error uploading run:', result.error);
                console.log('response:', response);
            }
        } catch (error) {
            console.error('Error uploading run:', error);
        }
    }

    async function attackBoss(wpm) {
        try {
            const response = await fetch('/boss/attack', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wpm })
            });

            const result = await response.json();
            if (response.ok) {
                return result;
            } else {
                console.error('Error attacking boss:', result.error);
                return null;
            }
        } catch (error) {
            console.error('Error attacking boss:', error);
            return null;
        }
    }
}

export default Typing_Test_Root;