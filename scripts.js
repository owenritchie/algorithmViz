const container = document.getElementById('container');
const algorithmSelect = document.getElementById('algorithm');
const visualizeButton = document.getElementById('visualizeButton');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

let bars = [];
let speed = 7;

const BASE_DELAY = 200;

function playSound(frequency, duration) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + duration);
    oscillator.stop(audioContext.currentTime + duration);
}

function makeBars() {
    bars = [];
    container.innerHTML = '';
    for (let i = 0; i < 70; i++) {
        const bar = document.createElement('div');
        bar.classList.add('bar');
        bar.style.height = Math.floor(Math.random() * 100) + '%';
        bar.style.backgroundColor = getRandomGreenShade();
        container.appendChild(bar);
        bars.push(bar);
    }
}
makeBars();

function getRandomGreenShade() {
    const shades = ['#81C14B', '#2E933C', '#297045'];
    return shades[Math.floor(Math.random() * shades.length)];
}

function highlightBars(arr, indices) {
    indices.forEach(index => {
        arr[index].style.backgroundColor = '#DD3A6B';
    });
}

function resetBars(arr, indices) {
    indices.forEach(index => {
        arr[index].style.backgroundColor = getRandomGreenShade();
    });
}

function swap(arr, i, j) {
    return new Promise(resolve => {
        highlightBars(arr, [i, j]);
        const freq1 = parseInt(arr[i].style.height) * 10 + 100;
        const freq2 = parseInt(arr[j].style.height) * 10 + 100;
        playSound(freq1, 0.1);
        playSound(freq2, 0.1);
        setTimeout(() => {
            let tempHeight = arr[i].style.height;
            arr[i].style.height = arr[j].style.height;
            arr[j].style.height = tempHeight;
            resetBars(arr, [i, j]);
            resolve();
        }, BASE_DELAY / speed);
    });
}

async function selectionSort(arr) {
    for (let i = 0; i < arr.length; i++) {
        arr[i].style.backgroundColor = '#ECBA82';
        let minIndex = i;
        for (let j = i + 1; j < arr.length; j++) {
            if (parseInt(arr[j].style.height) < parseInt(arr[minIndex].style.height)) {
                minIndex = j;
            }
        }
        if (minIndex !== i) {
            await swap(arr, i, minIndex);
        }
        arr[i].style.backgroundColor = getRandomGreenShade();
    }
}

async function insertionSort(arr) {
    for (let i = 1; i < arr.length; i++) {
        arr[i].style.backgroundColor = '#ECBA82';
        let j = i;
        while (j > 0 && parseInt(arr[j].style.height) < parseInt(arr[j - 1].style.height)) {
            await swap(arr, j, j - 1);
            j--;
        }
        arr[i].style.backgroundColor = getRandomGreenShade();
    }
}

async function bubbleSort(arr) {
    for (let i = 0; i < arr.length - 1; i++) {
        for (let j = 0; j < arr.length - 1 - i; j++) {
            if (parseInt(arr[j].style.height) > parseInt(arr[j + 1].style.height)) {
                await swap(arr, j, j + 1);
            }
        }
    }
}

async function mergeSort(arr) {
    if (arr.length <= 1) return arr;

    const mid = Math.floor(arr.length / 2);
    const left = arr.slice(0, mid);
    const right = arr.slice(mid);

    return await merge(await mergeSort(left), await mergeSort(right));
}

async function merge(left, right) {
    let result = [], i = 0, j = 0;

    while (i < left.length && j < right.length) {
        highlightBars([left[i], right[j]], [0, 1]);
        const freq1 = parseInt(left[i].style.height) * 10 + 100;
        const freq2 = parseInt(right[j].style.height) * 10 + 100;
        playSound(freq1, 0.1);
        playSound(freq2, 0.1);

        if (parseInt(left[i].style.height) < parseInt(right[j].style.height)) {
            result.push(left[i++]);
        } else {
            result.push(right[j++]);
        }
        await new Promise(resolve => setTimeout(resolve, BASE_DELAY / speed));
        if (i > 0) resetBars([left[i - 1]], [0]);
        if (j > 0) resetBars([right[j - 1]], [0]);
    }

    result = result.concat(left.slice(i)).concat(right.slice(j));

    for (let k = 0; k < result.length; k++) {
        bars[k] = result[k];
        highlightBars([result[k]], [0]);
        const freq = parseInt(result[k].style.height) * 10 + 100;
        playSound(freq, 0.1);
        container.appendChild(result[k]);
        await new Promise(resolve => setTimeout(resolve, BASE_DELAY / speed));
        resetBars([result[k]], [0]);
    }

    return result;
}

async function quicksort(arr, left = 0, right = arr.length - 1) {
    if (left < right) {
        let pivotIndex = await partition(arr, left, right);
        await quicksort(arr, left, pivotIndex - 1);
        await quicksort(arr, pivotIndex + 1, right);
    }
}

async function partition(arr, left, right) {
    let pivotIndex = right;
    let pivotValue = parseInt(arr[pivotIndex].style.height);
    arr[pivotIndex].style.backgroundColor = '#ECBA82';
    right--;

    while (left <= right) {
        while (left <= right && parseInt(arr[left].style.height) < pivotValue) {
            left++;
        }
        while (left <= right && parseInt(arr[right].style.height) > pivotValue) {
            right--;
        }
        if (left <= right) {
            await swap(arr, left, right);
            left++;
            right--;
        }
    }
    await swap(arr, left, pivotIndex);
    arr[left].style.backgroundColor = '#297045';
    return left;
}

visualizeButton.addEventListener('click', () => {
    makeBars();
    speed = speedSlider.value;
    const selectedAlgorithm = algorithmSelect.value;
    switch (selectedAlgorithm) {
        case 'selection':
            selectionSort(bars);
            break;
        case 'merge':
            mergeSort(bars);
            break;
        case 'quick':
            quicksort(bars);
            break;
        case 'insertion':
            insertionSort(bars);
            break;
        case 'bubble':
            bubbleSort(bars);
            break;
        default:
            break;
    }
});

container.addEventListener('click', (event) => {
    if (event.target.classList.contains('bar')) {
        const height = parseInt(event.target.style.height);
        const frequency = height * 10 + 100;
        playSound(frequency, 0.5);
    } else {
        makeBars();
    }
});

speedSlider.addEventListener('input', (event) => {
    speed = event.target.value;
    speedValue.textContent = speed;
});

window.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        event.preventDefault();
    }
});
