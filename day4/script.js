// Select DOM elements
const noteTextarea = document.getElementById('note-text');
const charCountElem = document.getElementById('char-count');
const wordCountElem = document.getElementById('word-count');
const clearBtn = document.getElementById('clear-btn');
const themeToggleBtn = document.getElementById('theme-toggle');

// Update Character and Word Counters
function updateCounts() {
  const text = noteTextarea.value;
  const charLength = text.length;

  // Calculate word count (filter out empty strings from splitting whitespace)
  const trimmedText = text.trim();
  const wordCount = trimmedText === '' ? 0 : trimmedText.split(/\s+/).length;

  // Update text content
  charCountElem.textContent = `${charLength} / 200 characters`;
  wordCountElem.textContent = `${wordCount} words`;

  // Handle warning / over classes for character count
  charCountElem.classList.remove('warning', 'over');
  if (charLength > 200) {
    charCountElem.classList.add('over');
  } else if (charLength > 180) {
    charCountElem.classList.add('warning');
  }
}

// Clear input, reset counters, and delete saved draft
function clearAll() {
  noteTextarea.value = '';
  localStorage.removeItem('noteDraft');
  updateCounts();
}

// Event Listeners for Textarea (Input & Escape key)
noteTextarea.addEventListener('input', () => {
  updateCounts();
  localStorage.setItem('noteDraft', noteTextarea.value);
});

noteTextarea.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    clearAll();
  }
});

// Clear Button
clearBtn.addEventListener('click', clearAll);

// Theme Toggle Button
themeToggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  themeToggleBtn.textContent = isDark ? 'Light mode' : 'Dark mode';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// Initialize state on page load
function init() {
  // Restore saved theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
    themeToggleBtn.textContent = 'Light mode';
  } else {
    document.body.classList.remove('dark');
    themeToggleBtn.textContent = 'Dark mode';
  }

  // Restore saved draft
  const savedDraft = localStorage.getItem('noteDraft');
  if (savedDraft !== null) {
    noteTextarea.value = savedDraft;
  }

  // Initial count update
  updateCounts();
}

// Run initialization
init();