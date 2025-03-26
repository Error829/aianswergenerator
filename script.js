const API_KEY = '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';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Configure marked.js
marked.setOptions({
    gfm: true,
    breaks: true,
    highlight: function(code, language) {
        if (language && hljs.getLanguage(language)) {
            try {
                return hljs.highlight(code, { language }).value;
            } catch (err) {}
        }
        return code;
    }
});

// Create answer container if not exists
function createAnswerContainer() {
    let container = document.getElementById('answer-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'answer-container';
        container.className = 'mt-6 knowledge-card hidden';
        document.querySelector('#generator-tool .bg-white').appendChild(container);
    }
    return container;
}

// Create answer actions
function createAnswerActions() {
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'answer-actions';
    
    const convertBackButton = document.createElement('button');
    convertBackButton.className = 'btn-convert';
    convertBackButton.innerHTML = '<i class="fa-solid fa-file-lines mr-2"></i> View as Plain Text';
    convertBackButton.onclick = () => {
        const answerContainer = document.getElementById('answer-container');
        if (answerContainer.classList.contains('knowledge-card')) {
            answerContainer.className = 'mt-6 bg-white/80 rounded-lg p-6 border border-[#d2d2d7]';
            convertBackButton.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles mr-2"></i> View as Knowledge Card';
        } else {
            answerContainer.className = 'mt-6 knowledge-card';
            convertBackButton.innerHTML = '<i class="fa-solid fa-file-lines mr-2"></i> View as Plain Text';
        }
    };
    
    actionsDiv.appendChild(convertBackButton);
    return actionsDiv;
}

// Create loading animation
function createLoadingAnimation() {
    return `
    <div class="flex flex-col items-center justify-center p-8 text-[#1d1d1f]">
        <div class="flex items-center gap-3 text-lg font-medium mb-4">
            <i class="fa-solid fa-robot fa-bounce text-2xl text-[#007AFF]"></i>
            <span>AI is thinking...</span>
        </div>
        <div class="flex gap-2">
            <div class="w-3 h-3 rounded-full bg-[#007AFF] animate-bounce" style="animation-delay: 0s"></div>
            <div class="w-3 h-3 rounded-full bg-[#007AFF] animate-bounce" style="animation-delay: 0.2s"></div>
            <div class="w-3 h-3 rounded-full bg-[#007AFF] animate-bounce" style="animation-delay: 0.4s"></div>
        </div>
    </div>`;
}

// Stream handler for the response
async function handleStream(response, answerContainer) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let markdown = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
            if (line.trim() === '') continue;
            if (line.startsWith('data: ')) {
                const data = line.slice(5);
                if (data === '[DONE]') continue;
                try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices[0]?.delta?.content || '';
                    if (content) {
                        markdown += content;
                        // Render the accumulated markdown
                        answerContainer.innerHTML = marked.parse(markdown);
                        // Highlight any code blocks
                        answerContainer.querySelectorAll('pre code').forEach((block) => {
                            hljs.highlightBlock(block);
                        });
                    }
                } catch (e) {
                    console.error('Error parsing JSON:', e);
                }
            }
        }
    }
    
    // Add toggle view button after response is complete
    answerContainer.appendChild(createAnswerActions());
}

// Main function to generate answer
async function generateAnswer() {
    const questionInput = document.getElementById('question-input');
    const generateButton = document.querySelector('.btn-primary');
    const question = questionInput.value.trim();

    if (!question) {
        alert('Please enter a question');
        return;
    }

    // Disable input and button while generating
    questionInput.disabled = true;
    generateButton.disabled = true;
    // Add loading state with pulse animation
    generateButton.innerHTML = `
        <div class="inline-flex items-center">
            <svg class="animate-pulse mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="animate-pulse">Generating...</span>
        </div>
    `;
    generateButton.classList.add('opacity-90', 'hover:opacity-100', 'transition-opacity');

    const answerContainer = createAnswerContainer();
    // Show loading animation
    answerContainer.innerHTML = createLoadingAnimation();
    answerContainer.classList.remove('hidden');

    // System prompt to guide the AI's response style
    const systemPrompt = `You are a helpful and engaging AI assistant. When answering questions:
1. Start with a relevant emoji that matches the topic
2. Use appropriate emojis throughout your response to emphasize key points
3. Break down complex information into clear sections with emoji bullet points
4. Use markdown formatting to structure your response
5. When explaining concepts, use analogies and visual descriptions
6. End your response with a relevant emoji or icon
7. For technical topics, use 💡 before important tips
8. Use 📌 for key takeaways
9. For lists or steps, use numbered emojis (1️⃣, 2️⃣, etc.)
10. Add ⭐️ before particularly important information
11. Use 🔍 when providing detailed explanations
12. Include 💭 for thought-provoking points
13. Use 🌟 to highlight examples
14. Add 📝 before summaries or conclusions

Keep your response clear and professional while making it visually engaging.`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-chat-v3-0324:free',
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: question
                    }
                ],
                stream: true
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        await handleStream(response, answerContainer);
    } catch (error) {
        answerContainer.innerHTML = `<div class="text-red-500">Error: ${error.message}</div>`;
    } finally {
        // Re-enable input and button
        questionInput.disabled = false;
        generateButton.disabled = false;
        generateButton.classList.remove('opacity-90', 'hover:opacity-100', 'transition-opacity');
        generateButton.innerHTML = '<i class="fa-solid fa-bolt mr-2"></i> Generate AI Answer';
    }
}

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const generateButton = document.querySelector('.btn-primary');
    generateButton.addEventListener('click', generateAnswer);

    // Add enter key support for textarea
    const questionInput = document.getElementById('question-input');
    questionInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            generateAnswer();
        }
    });
});

// FAQ Accordion functionality
document.addEventListener('DOMContentLoaded', function() {
    const faqToggles = document.querySelectorAll('.faq-toggle');
    
    faqToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            // Get the content panel
            const content = this.nextElementSibling;
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            const chevron = this.querySelector('.fa-chevron-down');
            
            // Close all other FAQs
            faqToggles.forEach(otherToggle => {
                if (otherToggle !== toggle) {
                    otherToggle.setAttribute('aria-expanded', 'false');
                    otherToggle.nextElementSibling.classList.add('hidden');
                    otherToggle.querySelector('.fa-chevron-down').classList.remove('rotate-180');
                }
            });
            
            // Toggle current FAQ
            this.setAttribute('aria-expanded', !isExpanded);
            content.classList.toggle('hidden');
            
            // Rotate chevron icon
            if (isExpanded) {
                chevron.classList.remove('rotate-180');
            } else {
                chevron.classList.add('rotate-180');
            }
        });
    });
}); 