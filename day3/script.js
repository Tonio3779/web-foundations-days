// Starting data
let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];

// 1. searchNotes(word)
function searchNotes(word) {
  const searchTerm = word.toLowerCase();
  return notes.filter((note) => note.text.toLowerCase().includes(searchTerm));
}

// 2. longestNote()
function longestNote() {
  if (notes.length === 0) return null;
  return notes.reduce((longest, current) =>
    current.text.length > longest.text.length ? current : longest
  );
}

// 3. countByCategory()
function countByCategory() {
  const counts = {};
  for (const note of notes) {
    counts[note.category] = (counts[note.category] || 0) + 1;
  }
  return counts;
}

// 4. getSummary()
function getSummary() {
  const total = notes.length;
  const noteWord = total === 1 ? "note" : "notes";
  const counts = countByCategory();

  const categoryDetails = Object.entries(counts)
    .map(([cat, count]) => `${count} ${cat}`)
    .join(", ");

  return `${total} ${noteWord}: ${categoryDetails}.`;
}

// 5. isDuplicate(text)
function isDuplicate(text) {
  const cleanText = text.trim().toLowerCase();
  return notes.some(
    (note) => note.text.trim().toLowerCase() === cleanText
  );
}

// 6. addNote(text, category)
function addNote(text, category) {
  const validCategories = ["personal", "work", "study"];

  if (!text || text.length < 1 || text.length > 200) {
    console.log("Failed to add note: Text must be between 1 and 200 characters.");
    return false;
  }

  if (!validCategories.includes(category)) {
    console.log(`Failed to add note: Category must be one of: ${validCategories.join(", ")}.`);
    return false;
  }

  if (isDuplicate(text)) {
    console.log("Failed to add note: A duplicate note already exists.");
    return false;
  }

  const newId = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) + 1 : 1;
  notes.push({ id: newId, text: text.trim(), category: category });
  return true;
}

// ==========================================
// TESTS AND CONSOLE LOGS
// ==========================================

console.log("--- 1. searchNotes ---");
console.log(searchNotes("DAY")); 
// Expected output: Array with 1 object: [{ id: 2, text: "Finish the Day 3 assignment", category: "study" }]
console.log(searchNotes("python")); 
// Expected output: [] (empty array)

console.log("\n--- 2. longestNote ---");
console.log(longestNote()); 
// Expected output: { id: 3, text: "Email the project report to Grace", category: "work" }
const tempNotes = notes;
notes = [];
console.log(longestNote()); 
// Expected output: null
notes = tempNotes; // Restore array

console.log("\n--- 3. countByCategory ---");
console.log(countByCategory()); 
// Expected output: { personal: 2, study: 2, work: 1 }

console.log("\n--- 4. getSummary ---");
console.log(getSummary()); 
// Expected output: "5 notes: personal 2, study 2, work 1." (or matching exact count format)

console.log("\n--- 5. isDuplicate ---");
console.log(isDuplicate("  call MUM ")); 
// Expected output: true
console.log(isDuplicate("Prepare dinner")); 
// Expected output: false

console.log("\n--- 6. addNote ---");
console.log(addNote("Practice CSS Grid", "study")); 
// Expected output: true
console.log(addNote("Call mum", "personal")); 
// Expected output: "Failed to add note: A duplicate note already exists." followed by false
console.log(addNote("Invalid Category Note", "shopping")); 
// Expected output: "Failed to add note: Category must be one of: personal, work, study." followed by false
console.log(addNote("", "work")); 
// Expected output: "Failed to add note: Text must be between 1 and 200 characters." followed by false