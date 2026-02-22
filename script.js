// State management
const state = {
    selectedDate: null,
    selectedRituals: new Set(),
    customEmojis: new Set()
};

// DOM elements
const datePicker = document.getElementById('date-picker');
const ritualButtons = document.querySelectorAll('.ritual-btn');
const emojiTrigger = document.getElementById('emoji-trigger');
const emojiPicker = document.getElementById('emoji-picker');
const emojiOptions = document.querySelectorAll('.emoji-option');
const selectedEmojiDisplay = document.getElementById('selected-emoji');
const customEmojiDisplay = document.getElementById('custom-emoji-display');
const shareBtn = document.getElementById('share-btn');

// Set today's date as default
const today = new Date().toISOString().split('T')[0];
datePicker.value = today;
state.selectedDate = today;

// Date picker handler
datePicker.addEventListener('change', (e) => {
    state.selectedDate = e.target.value;
    updateShareButton();
});

// Ritual selection handler (multi-select)
ritualButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const ritual = btn.dataset.ritual;

        if (state.selectedRituals.has(ritual)) {
            state.selectedRituals.delete(ritual);
            btn.classList.remove('selected');
        } else {
            state.selectedRituals.add(ritual);
            btn.classList.add('selected');
        }

        updateShareButton();
    });
});

// Emoji picker toggle
emojiTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = emojiPicker.style.display === 'block';
    emojiPicker.style.display = isVisible ? 'none' : 'block';
});

// Close emoji picker when clicking outside
document.addEventListener('click', (e) => {
    if (!emojiPicker.contains(e.target) && e.target !== emojiTrigger) {
        emojiPicker.style.display = 'none';
    }
});

// Emoji selection handler
emojiOptions.forEach(option => {
    option.addEventListener('click', (e) => {
        e.stopPropagation();
        const emoji = option.dataset.emoji;

        if (!state.customEmojis.has(emoji)) {
            state.customEmojis.add(emoji);
            addCustomEmojiBadge(emoji);
            updateSelectedEmojiDisplay();
            updateShareButton();
        }

        emojiPicker.style.display = 'none';
    });
});

// Add custom emoji badge
function addCustomEmojiBadge(emoji) {
    const badge = document.createElement('div');
    badge.className = 'custom-emoji-badge';
    badge.innerHTML = `
        <span>${emoji}</span>
        <button onclick="removeCustomEmoji('${emoji}')" aria-label="Remove emoji">×</button>
    `;
    customEmojiDisplay.appendChild(badge);
}

// Remove custom emoji
window.removeCustomEmoji = function(emoji) {
    state.customEmojis.delete(emoji);
    updateCustomEmojiDisplay();
    updateSelectedEmojiDisplay();
    updateShareButton();
};

// Update custom emoji display
function updateCustomEmojiDisplay() {
    customEmojiDisplay.innerHTML = '';
    state.customEmojis.forEach(emoji => {
        addCustomEmojiBadge(emoji);
    });
}

// Update the selected emoji icon display
function updateSelectedEmojiDisplay() {
    if (state.customEmojis.size > 0) {
        selectedEmojiDisplay.textContent = '✨';
    } else {
        selectedEmojiDisplay.textContent = '➕';
    }
}

// Enable/disable share button based on selections
function updateShareButton() {
    const hasDate = state.selectedDate !== null;
    const hasSelections = state.selectedRituals.size > 0 || state.customEmojis.size > 0;

    shareBtn.disabled = !(hasDate && hasSelections);
}

// Share functionality
shareBtn.addEventListener('click', async () => {
    const message = generateShareMessage();

    // Use Web Share API if available
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'My Daily Rituals ✨',
                text: message
            });
        } catch (err) {
            if (err.name !== 'AbortError') {
                fallbackShare(message);
            }
        }
    } else {
        fallbackShare(message);
    }

    // Add celebration animation
    celebrateShare();
});

// Generate share message
function generateShareMessage() {
    const date = new Date(state.selectedDate);
    const formattedDate = date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    const ritualEmojis = {
        coffee: '☕',
        learning: '📚',
        working: '🔨',
        fruit: '🍓'
    };

    let message = `✨ My Daily Rituals - ${formattedDate}\n\n`;

    // Add selected rituals
    if (state.selectedRituals.size > 0) {
        message += 'Today I enjoyed:\n';
        state.selectedRituals.forEach(ritual => {
            const emoji = ritualEmojis[ritual];
            const name = ritual.charAt(0).toUpperCase() + ritual.slice(1);
            message += `${emoji} ${name}\n`;
        });
    }

    // Add custom emojis
    if (state.customEmojis.size > 0) {
        message += '\nAnd also:\n';
        state.customEmojis.forEach(emoji => {
            message += `${emoji} `;
        });
        message += '\n';
    }

    message += '\n🎉 Celebrate the little moments!';

    return message;
}

// Fallback share (copy to clipboard)
function fallbackShare(message) {
    navigator.clipboard.writeText(message).then(() => {
        showNotification('Copied to clipboard! Share it with your friends 🎉');
    }).catch(() => {
        // If clipboard fails, show the message in an alert
        alert(message);
    });
}

// Show notification
function showNotification(text) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #E76F51 0%, #8B5E83 100%);
        color: white;
        padding: 16px 24px;
        border-radius: 100px;
        font-family: 'DM Sans', sans-serif;
        font-weight: 500;
        box-shadow: 0 8px 24px rgba(139, 94, 131, 0.4);
        z-index: 1001;
        animation: slideInDown 0.3s ease-out;
    `;
    notification.textContent = text;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutUp 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Celebrate animation on share
function celebrateShare() {
    const button = shareBtn;
    button.style.animation = 'none';
    setTimeout(() => {
        button.style.animation = 'pulse 0.5s ease-in-out';
    }, 10);
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }

    @keyframes slideOutUp {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
    }

    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
    }
`;
document.head.appendChild(style);

// Initialize
updateShareButton();
