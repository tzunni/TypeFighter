import React, {useState} from 'react';
import './App.css';
import Typing_Test_Root from './typing_prompt.js';
import ui_handler from './web_display.js';

async function fetchRandomPrompt() {
    try {
        const response = await fetch('/random-prompt', { method: 'GET' });
        const result = await response.json();

        if (response.ok) {
            console.log('Random Prompt:', result);
            return result.prompt; // Return the prompt text
        } else {
            console.error('Error fetching random prompt:', result.error);
            return 'Error fetching prompt';
        }
    } catch (error) {
        console.error('Error fetching random prompt:', error);
        return 'Error fetching prompt';
    }
}

function App() {
    const [page_state, set_page_state] = useState("home");
    const [promptId, setPromptId] = useState(null); // Add state for prompt ID
    const [source, setSource] = useState(null); // Add state for source

    const update_book_prompt = async () => {
        const response = await fetch('/random-prompt', { method: 'GET' });
        const result = await response.json();

        if (response.ok) {
            console.log('Random Prompt:', result);
            setPromptId(result.id); // Store the prompt ID
            setSource(result.source); // Store the source
            document.getElementById('prompt_display_box').textContent = result.prompt;
        } else {
            console.error('Error fetching random prompt:', result.error);
            document.getElementById('prompt_display_box').textContent = 'Error fetching prompt';
        }
    };

    let current_page;

    switch (page_state) {
        case "home":
            current_page = (
                <div className="main_block">
                    <div className="title">TypeFighter</div>
                    <div className="subtitle">Will the boss fall today?</div>
                    <img className="boss" src="/1200px-Bowser.webp" alt="Bowser" />
                    <div className="hp-bar">HP: 100%</div>
                    <button
                        id="attack-button"
                        onClick={() => {
                            set_page_state("typing_test");
                            update_book_prompt();
                        }}
                    >
                        Attack!
                    </button>
                </div>
            );
            break;
        case "typing_test":
            current_page = (
                <Typing_Test_Root
                    update_book_prompt={update_book_prompt}
                    route_home={() => set_page_state("home")}
                    promptId={promptId} // Pass the prompt ID to the component
                    source={source} // Pass the source to the component
                />
            );
            break;

        default:
            current_page = <div>Page not found!</div>;
            break;
    }

    return (
        <div className="App" id="UI">
            {current_page}
        </div>
    );
}

export default App;

