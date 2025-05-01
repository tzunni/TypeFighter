import React, {useState} from 'react';
import './App.css';
import Typing_Test_Root from './typing_prompt.js';
import ui_handler from './web_display.js'

function App() {
    const [page_state, set_page_state] = useState("home");
    const valid_states = ["home", "typing_test"]

    const updateBookPrompt = async () => {
        ui_handler.get_book_data('OL7353617M');
    };

    let current_page;

    switch(page_state){
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
                            updateBookPrompt();
                        }}
                    >
                    Attack!
                </button>
            </div> // end home
            );
            break
        case "typing_test":
            current_page = <Typing_Test_Root updateBookPrompt={updateBookPrompt} />;
            break;

        default:
            current_page = <div>Page not found!</div>
            break;
    }

    return (
        <div className="App" id="UI">
            {current_page}
        </div>
    );
}

export default App;

