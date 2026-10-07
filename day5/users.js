// State storage
let allUsers = [];

// DOM Element references
const loadBtn = document.querySelector('#load-users');
const filterInput = document.querySelector('#filter-input');
const statusElem = document.querySelector('#status');
const usersList = document.querySelector('#users-list');

// Render user list safely using createElement and textContent
function renderUsers(list) {
  usersList.innerHTML = ''; // Clear existing list

  if (list.length === 0) {
    const noMatchItem = document.createElement('li');
    noMatchItem.textContent = 'No users match your filter.';
    usersList.appendChild(noMatchItem);
    return;
  }

  list.forEach(user => {
    const li = document.createElement('li');
    li.className = 'user-card';

    const nameElem = document.createElement('div');
    nameElem.className = 'user-name';
    nameElem.textContent = user.name;

    const emailElem = document.createElement('div');
    emailElem.className = 'user-info';
    emailElem.textContent = `Email: ${user.email}`;

    const cityElem = document.createElement('div');
    cityElem.className = 'user-info';
    cityElem.textContent = `City: ${user.address ? user.address.city : 'N/A'}`;

    const companyElem = document.createElement('div');
    companyElem.className = 'user-info';
    companyElem.textContent = `Company: ${user.company ? user.company.name : 'N/A'}`;

    li.appendChild(nameElem);
    li.appendChild(emailElem);
    li.appendChild(cityElem);
    li.appendChild(companyElem);

    usersList.appendChild(li);
  });
}

// Fetch users async function
async function loadUsers() {
  loadBtn.disabled = true;
  statusElem.textContent = 'Loading users...';
  usersList.innerHTML = '';

  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/users');

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    allUsers = data;

    statusElem.textContent = `Successfully loaded ${allUsers.length} users.`;
    renderUsers(allUsers);
  } catch (error) {
    statusElem.textContent = 'Failed to load users. Please check your connection.';
    allUsers = [];
    renderUsers([]);
  } finally {
    loadBtn.disabled = false;
  }
}

// Filter handler on input event
filterInput.addEventListener('input', () => {
  const query = filterInput.value.trim().toLowerCase();
  const filtered = allUsers.filter(user =>
    user.name.toLowerCase().includes(query)
  );
  renderUsers(filtered);
});

// Event listener for button click
loadBtn.addEventListener('click', loadUsers);