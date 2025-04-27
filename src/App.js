import React, {useState} from 'react';
import './App.css';
import Typing_Test_Root from './typing_prompt.js';

function App() {
    const [page_state, set_page_state] = useState("home");
    const valid_states = ["home", "typing_test"]

    let current_page;

    switch(page_state){
        case "home":
            current_page = (
            <div>
                <div className="title">TypeFighter</div>
                <div className="subtitle">Will the boss fall today?</div>
                <img className="boss" src="/1200px-Bowser.webp" alt="Bowser" />
                <div className="hp-bar">HP: 100%</div>
                <button
                    id="attack-button"
                    onClick={() => set_page_state("typing_test")}
                    >
                    Attack!
                </button>
            </div> // end home
            );
            break
        case "typing_test":
            current_page = <Typing_Test_Root />;
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

