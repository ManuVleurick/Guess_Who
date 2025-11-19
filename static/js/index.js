// ---------- Demo personas (for standalone mode) ----------
const PERSONAS = [
    {
    name: 'Leonardo da Vinci',
    },
    {
    name: 'Cleopatra',
    },
    {
    name: 'Alan Turing'
    },
    {
    name: 'Julius Caesar'
    },
    {
    name: 'Donald Trump'
    },
    {
    name: 'Joe Biden'
    },
    {
    name: 'Alexander the Great'
    },
];

let counter = 15;
let score = 0;  // start at 0

// ---------- UI helpers ----------
const messagesEl = document.getElementById('messages');
const inputEl = document.getElementById('input');
const guessEl = document.getElementById('guess');
const sendBtn = document.getElementById('send');
const guessBtn = document.getElementById('tryGuess');
const newGameBtn = document.getElementById('newGame');
const celebrationEl = document.getElementById('celebration');
const celebrationNewGameBtn = document.getElementById('celebrationNewGame');
const counterEl = document.getElementById('counter');
const gameOverEl = document.getElementById('gameOver');
const gameOverNewGameBtn = document.getElementById('gameOverNewGame');
const scoreBox = document.getElementById('scoreBox');

let sessionId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
let persona = null;

let gameOver = false;

function appendMessage(text, who='ai'){
    const div = document.createElement('div');
    div.className = 'msg ' + (who === 'user' ? 'user' : 'ai');
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight - messagesEl.clientHeight;
}

function escapeHtml(str){ return String(str).replace(/[&<>"']/g, (s)=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[s])) }

function updateScore(change) {
    score += change;
    scoreBox.textContent = `Score: ${score}`;

    // add bounce animation
    scoreBox.classList.add('bounce');

    // remove class after animation completes so it can trigger again
    setTimeout(() => {
        scoreBox.classList.remove('bounce');
    }, 500);
}

// ---------- Game logic (demo fallback) ----------
function startDemoGame(){
    gameOver = false;
    counter = 15;                    // reset counter
    counterEl.textContent = counter; 
    guessEl.value = ''
    guessEl.value = ''
    persona = PERSONAS[Math.floor(Math.random() * PERSONAS.length)];
    console.log(persona.name)
    messagesEl.innerHTML = '';
    appendMessage('Hello. Ask me about my life, my work, or make a guess.');
}

async function demoProcessUserMessage(msg){
    appendMessage(msg, 'user');

    // if user explicitly asks name, refuse
    content = await get_content(msg)
    appendMessage(content,'ai')
}

async function get_content(msg) {
    const response = await fetch("http://127.0.0.1:5500/get_content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ msg: msg, persona: persona.name })
    });
    const data = await response.json();
    return data.result
}

async function demoTryGuess(value){
    const guess = (value||'').trim();
    appendMessage(`Guess: ${guess}`, 'user');

    // compare normalized names (very simple)
    content = await try_guess(guess)

    // If the backend says the guess is correct
    if (content.toLowerCase().includes("true")) {
        celebrationEl.classList.remove("hidden");
         celebrationEl.querySelector('.popup').classList.add('bounce');

        // remove bounce after animation so it can trigger again next time
        setTimeout(() => {
            celebrationEl.querySelector('.popup').classList.remove('bounce');
        }, 500);
        decrement(-3)
        updateScore(counter);
    } else {
        appendMessage(content, 'ai');
    }

}

async function try_guess(guess) {
    const response = await fetch("http://127.0.0.1:5500/try_guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ msg: guess, persona: persona.name })
    });
    const data = await response.json();
    return data.result
}

// Press Enter in chat input → send
document.getElementById('input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('send').click();
    }
});

// Press Enter in guess input → submit guess
document.getElementById('guess').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('tryGuess').click();
    }
});

function decrement(amount) {
    counter -= amount;
    if (counter < 0) counter = 0;

    counterEl.textContent = counter;

    if (counter === 0) {
        gameOverEl.classList.remove("hidden");
        gameOverEl.querySelector('.popup').classList.add('bounce');
        gameOver = true;
        updateScore(-5);

        setTimeout(() => {
            gameOverEl.querySelector('.popup').classList.remove('bounce');
        }, 500);
        }
}


// ---------- Event wiring ----------
sendBtn.addEventListener('click', async ()=>{
    if (gameOver) return;

    const msg = inputEl.value.trim(); 
    if (!msg) return;
    inputEl.value = '';

    decrement(1);   // ▼▼ NEW ▼▼
    demoProcessUserMessage(msg);
});


guessBtn.addEventListener('click', async ()=>{
    if (gameOver) return;

    const g = guessEl.value.trim(); 
    if (!g) return;
    guessEl.value = '';

    decrement(3);
    demoTryGuess(g);
});

newGameBtn.addEventListener('click', ()=>{ startDemoGame(); });

celebrationNewGameBtn.addEventListener('click', () => {
    celebrationEl.classList.add("hidden"); // hide popup
    startDemoGame();                       // start new game using your existing logic
});

gameOverNewGameBtn.addEventListener('click', () => {
    gameOverEl.classList.add("hidden");
    startDemoGame();
});

// allow Enter to send
inputEl.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); sendBtn.click(); } });
guessEl.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); guessBtn.click(); } });

// initial
startDemoGame();