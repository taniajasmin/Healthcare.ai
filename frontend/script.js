let recognition = null;
let isRecording = false;
let availableVoices = [];

// Speech recognition initialization
function initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
        recognition = new SpeechRecognition();
    } else {
        showError("Speech recognition is not supported in this browser. Please use Chrome.");
        return false;
    }

    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
        showStatus("Listening...");
    };

    recognition.onend = () => {
        if (isRecording) {
            recognition.start();
        } else {
            showStatus("Stopped listening.");
        }
    };

    recognition.onerror = (event) => {
        showError(`Error: ${event.error}`);
        stopRecording();
    };

    recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
        
        document.getElementById('originalText').textContent = transcript;
    };

    return true;
}

// Translation function
async function translateText(text) {
    try {
        const sourceLang = document.getElementById('sourceLang').value;
        const targetLang = document.getElementById('targetLang').value;

        console.log('Sending translation request:', {
            text: text,
            source_lang: sourceLang,
            target_lang: targetLang
        });

        const response = await fetch('http://localhost:8000/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text,
                source_lang: sourceLang,
                target_lang: targetLang
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Translation failed');
        }

        const data = await response.json();
        console.log('Translation response:', data);

        // Update original and translated text
        document.getElementById('originalText').textContent = data.original;
        document.getElementById('translationText').textContent = data.translation;

        // Handle context section
        const contextSection = document.getElementById('contextSection');
        const contextText = document.getElementById('contextText');
        if (data.context && data.context.trim()) {
            contextText.textContent = data.context;
            contextSection.style.display = 'block';
        } else {
            contextSection.style.display = 'none';
        }
    } catch (error) {
        console.error('Translation error:', error);
        showError(`Translation failed: ${error.message}`);
        
        // Hide context section on error
        const contextSection = document.getElementById('contextSection');
        contextSection.style.display = 'none';
    }
}

// Play text function
function playText(elementId, langSelectId) {
    const text = document.getElementById(elementId).textContent;
    const lang = document.getElementById(langSelectId).value;
    
    if (!text) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;

    const voices = availableVoices.filter(voice => voice.lang.startsWith(lang.split('-')[0]));
    if (voices.length > 0) {
        utterance.voice = voices[0];
    }

    utterance.onstart = () => showStatus("Playing audio...");
    utterance.onend = () => showStatus("");
    utterance.onerror = () => showError("Error playing audio");

    window.speechSynthesis.speak(utterance);
}

// Toggle recording
function toggleRecording() {
    if (!recognition) {
        if (!initializeSpeechRecognition()) return;
    }

    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

function startRecording() {
    recognition.lang = document.getElementById('sourceLang').value;
    recognition.start();
    isRecording = true;
    document.getElementById('startRecording').textContent = 'Stop Recording';
    document.getElementById('startRecording').classList.add('recording');
}

function stopRecording() {
    recognition.stop();
    isRecording = false;
    document.getElementById('startRecording').textContent = 'Start Recording';
    document.getElementById('startRecording').classList.remove('recording');
    showStatus("");

    // Only translate if there's text
    const transcript = document.getElementById('originalText').textContent;
    if (transcript.trim()) {
        translateText(transcript);
    }
}

// Utility functions
function showStatus(message) {
    const statusElement = document.getElementById('statusMessage');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = 'status-message';
    }
}

function showError(message) {
    const statusElement = document.getElementById('statusMessage');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = 'error-message';
    }
}

// Initialize
window.onload = () => {
    // Load available voices
    window.speechSynthesis.onvoiceschanged = () => {
        availableVoices = window.speechSynthesis.getVoices();
    };

    // Initialize speech recognition
    initializeSpeechRecognition();

    // Add event listeners
    const startRecordingButton = document.getElementById('startRecording');
    if (startRecordingButton) {
        startRecordingButton.onclick = toggleRecording;
    }
    
    // Handle language changes
    const sourceLangSelect = document.getElementById('sourceLang');
    if (sourceLangSelect) {
        sourceLangSelect.onchange = () => {
            if (isRecording) {
                stopRecording();
                startRecording();
            }
        };
    }

    const targetLangSelect = document.getElementById('targetLang');
    if (targetLangSelect) {
        targetLangSelect.onchange = () => {
            const originalText = document.getElementById('originalText').textContent;
            if (originalText.trim()) {
                translateText(originalText);
            }
        };
    }

    // Add play buttons functionality
    const originalPlayButton = document.getElementById('playOriginal');
    if (originalPlayButton) {
        originalPlayButton.onclick = () => playText('originalText', 'sourceLang');
    }

    const translationPlayButton = document.getElementById('playTranslation');
    if (translationPlayButton) {
        translationPlayButton.onclick = () => playText('translationText', 'targetLang');
    }
};

// Error handling for unhandled promises
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    showError(`An unexpected error occurred: ${event.reason}`);
});