
const MIN = 100;
const MAX = 999;
const pinInput = document.getElementById('pin');
const sha256HashView = document.getElementById('sha256-hash');
const resultView = document.getElementById('result');

// Function to store data in local storage
function store(key, value) {
  localStorage.setItem(key, value);
}

// Function to retrieve data from local storage
function retrieve(key) {
  return localStorage.getItem(key);
}

// Generate a random 3-digit number
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Clear local storage
function clearStorage() {
  localStorage.clear();
}

// Generate SHA256 hash
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Generate and store hash
async function getSHA256Hash() {
  let cachedHash = retrieve('sha256');
  let cachedNumber = retrieve('sha256_number');

  if (cachedHash && cachedNumber) {
    return { hash: cachedHash, number: cachedNumber };
  }

  const randomNumber = getRandomNumber(MIN, MAX);
  const hash = await sha256(randomNumber.toString());

  store('sha256', hash);
  store('sha256_number', randomNumber);

  return { hash, number: randomNumber };
}

// Display the hash on UI
async function main() {
  sha256HashView.innerHTML = 'Calculating...';
  const { hash } = await getSHA256Hash();
  sha256HashView.innerHTML = hash;
}

// Validate user input
async function test() {
  const pin = pinInput.value;
  
  if (pin.length !== 3) {
    resultView.innerHTML = '💡 Enter a 3-digit number';
    resultView.classList.remove('hidden');
    return;
  }

  const { hash: storedHash, number: correctNumber } = await getSHA256Hash();
  const hashedPin = await sha256(pin);

  // Remove any previous classes and just keep the necessary ones
  resultView.className = '';
  
  if (hashedPin === storedHash) {
    resultView.innerHTML = '🎉 Success!';
    resultView.classList.add('success');
  } else {
    resultView.innerHTML = `❌ Incorrect! Try again`;
    console.log(`Correct number: ${correctNumber}`);
    // Clear the input field to allow for a new attempt
    pinInput.value = '';
    // Focus the input field for immediate new attempt
    pinInput.focus();
  }

  resultView.classList.remove('hidden');
}

// Restrict input to 3-digit numbers only
pinInput.addEventListener('input', (e) => {
  pinInput.value = e.target.value.replace(/\D/g, '').slice(0, 3);
});

// Attach event listener to button
document.getElementById('check').addEventListener('click', test);

main();