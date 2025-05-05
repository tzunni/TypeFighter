import React, {useState, useEffect} from 'react';
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

async function fetchBossData() {
    try {
        const response = await fetch('/boss', { method: 'GET' });
        const result = await response.json();

        if (response.ok) {
            console.log('Boss Data:', result);
            return result;
        } else {
            console.error('Error fetching boss data:', result.error);
        }
    } catch (error) {
        console.error('Error fetching boss data:', error);
    }
}

async function attackBoss(damage) {
    try {
        const response = await fetch('/boss/attack', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ damage })
        });
        const result = await response.json();

        if (response.ok) {
            console.log('Boss attacked:', result);
            return result; // Return the updated boss data
        } else {
            console.error('Error attacking boss:', result.error);
        }
    } catch (error) {
        console.error('Error attacking boss:', error);
    }
}

function App() {
    const [page_state, set_page_state] = useState("home");
    const [promptId, setPromptId] = useState(null);
    const [source, setSource] = useState(null);
    const [boss, setBoss] = useState(null);

    useEffect(() => {
        async function loadBossData() {
            const bossData = await fetchBossData();
            setBoss(bossData);
        }
        loadBossData();
    }, []);

    useEffect(() => {
        if (boss && boss.dead) {
            console.log('The boss has been defeated!');
        }
    }, [boss]);

    const update_book_prompt = async () => {
        const response = await fetch('/random-prompt', { method: 'GET' });
        const result = await response.json();

        if (response.ok) {
            console.log('Random Prompt:', result);
            setPromptId(result.id);
            setSource(result.source);
            document.getElementById('prompt_display_box').textContent = result.prompt;
        } else {
            console.error('Error fetching random prompt:', result.error);
            document.getElementById('prompt_display_box').textContent = 'Error fetching prompt';
        }
    };

    const handleTestComplete = async (wpm) => {
        console.log(`Test complete! WPM: ${wpm}`);
        const updatedBoss = await attackBoss(wpm); // Attack the boss with the player's WPM
        setBoss(updatedBoss); // Update the boss state in the home page
    };

    let current_page;

    switch (page_state) {
        case "home":
            current_page = (
                <div className="main_block">
                    <div className="title">TypeFighter</div>
                    <div className="subtitle">Will the boss fall today?</div>
                    {boss && (
                        <>
                            <img className="boss" src={boss.img_location} alt={boss.boss_name} />
                            <div className="hp-bar-container">
                                <div
                                    className="hp-bar-fill"
                                    style={{
                                        width: `${(boss.current_hp / boss.max_hp) * 100}%`,
                                    }}
                                ></div>
                                <div className="hp-bar-text">
                                    HP: {boss.current_hp}/{boss.max_hp} (
                                    {Math.round((boss.current_hp / boss.max_hp) * 100)}%)
                                </div>
                            </div>
                            <button
                                id="attack-button"
                                onClick={async () => {
                                    set_page_state("typing_test");
                                    update_book_prompt();
                                }}
                                disabled={boss.dead}
                            >
                                {boss.dead ? 'Boss Defeated!' : 'Attack!'}
                            </button>
                        </>
                    )}
                </div>
            );
            break;
        case "typing_test":
            current_page = (
                <Typing_Test_Root
                    update_book_prompt={update_book_prompt}
                    route_home={() => set_page_state("home")}
                    promptId={promptId}
                    source={source}
                    onTestComplete={handleTestComplete} // Pass the handler to Typing_Test_Root
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

