import './App.css';
import BookHandler from './typing_prompt.js';

function App() {
  return (
    <div className="App">
        <script src="typing_prompt.js"></script>
        <div class="App" id="UI">
          <div class="title">TypeFighter</div>
          <div class="subtitle">Will the boss fall today?</div>
          <div class="hp-bar">HP: 100%</div>
          <button className="attack-button" onClick={() => BookHandler.retrieve_book_data('OL7353617M')}>Attack!</button>
        </div>
    </div>
  );
}
export default App;
