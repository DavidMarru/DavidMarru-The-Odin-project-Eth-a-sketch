window.addEventListener('beforeunload', function (event) {
    event.returnValue = 'Are you sure you want to leave? Your changes may not be saved.';
});

let originalBackgroundColor = '#eee';
let originalGridBackgroundColor = '#eee';
const colorHistory = [];
const undoHistory = [];
const redoHistory = [];
let isClickAndHold = false;

function setGridSize(rows, columns) {
    if (confirm('Changing the grid size will clear the current sketch. Are you sure?')) {
        const gridContainer = document.getElementById('grid-container');
        gridContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

        gridContainer.innerHTML = '';

        for (let x = 0; x < rows; x++) {
            for (let y = 0; y < columns; y++) {
                const gridItem = document.createElement('div');
                gridItem.classList.add('grid-item');

                gridItem.addEventListener('mousedown', function () {
                    isClickAndHold = true;
                    const color = document.getElementById('colorPicker').value;

                    undoHistory.push({ element: this, color: this.style.backgroundColor });
                    this.style.backgroundColor = color;

                    if (color !== originalBackgroundColor) {
                        addToColorHistory(color);
                    }
                });

                gridItem.addEventListener('mouseup', function () {
                    isClickAndHold = false;
                    clearTimeout(undoTimeout);
                    clearTimeout(redoTimeout);
                });

                gridItem.addEventListener('mouseleave', function () {
                    if (isClickAndHold) {
                        const color = document.getElementById('colorPicker').value;
                        undoHistory.push({ element: this, color: this.style.backgroundColor });
                        this.style.backgroundColor = color;

                        if (color !== originalBackgroundColor) {
                            addToColorHistory(color);
                        }
                    }
                });

                gridContainer.appendChild(gridItem);
            }
        }
    }
}

function changeBackgroundColor(event) {
    document.getElementById('grid-container').style.backgroundColor = event.target.value;
    originalGridBackgroundColor = event.target.value;
}

function changeGridBackgroundColor(event) {
    originalGridBackgroundColor = event.target.value;
    const gridItems = document.querySelectorAll('.grid-item');
    gridItems.forEach(item => item.style.backgroundColor = originalGridBackgroundColor);
}

function resetColor() {
    document.getElementById('colorPicker').value = '#eeeeee';
}

function addToColorHistory(color) {
    if (color !== originalBackgroundColor && color !== '#eeeeee' && !colorHistory.includes(color)) {
        colorHistory.push(color);
        updateColorHistory();
    }
}

function removeColor() {
    const colorToRemove = document.getElementById('colorPicker').value;
    if (colorToRemove !== originalBackgroundColor) {
        const confirmed = confirm(`Are you sure you want to remove the color "${colorToRemove}" from history?`);

        if (confirmed) {
            const indexToRemove = colorHistory.indexOf(colorToRemove);
            if (indexToRemove !== -1) {
                colorHistory.splice(indexToRemove, 1);
                updateColorHistory();
            }
        }
    }
}

function updateColorHistory() {
    const colorHistoryContainer = document.getElementById('colorHistoryContainer');
    colorHistoryContainer.innerHTML = '';

    for (let i = Math.max(0, colorHistory.length - 10); i < colorHistory.length; i++) {
        const colorItem = document.createElement('div');
        colorItem.classList.add('color-history-item');
        colorItem.style.backgroundColor = colorHistory[i];
        colorItem.addEventListener('click', function () {
            document.getElementById('colorPicker').value = colorHistory[i];
        });
        colorHistoryContainer.appendChild(colorItem);
    }
}

function undo() {
    if (undoHistory.length > 0) {
        const lastAction = undoHistory.pop();
        redoHistory.push({ element: lastAction.element, color: lastAction.element.style.backgroundColor });
        lastAction.element.style.backgroundColor = lastAction.color;
    }
}

function redo() {
    if (redoHistory.length > 0) {
        const redoAction = redoHistory.pop();
        undoHistory.push({ element: redoAction.element, color: redoAction.element.style.backgroundColor });
        redoAction.element.style.backgroundColor = redoAction.color;
    }
}

function deleteAll() {
    const confirmDelete = confirm('Are you sure you want to delete all? This action cannot be undone.');

    if (confirmDelete) {
        const gridItems = document.querySelectorAll('.grid-item');
        gridItems.forEach(item => {
            undoHistory.push({ element: item, color: item.style.backgroundColor });
            item.style.backgroundColor = originalBackgroundColor;
        });
    }
}

function toggleGridLines() {
    const gridItems = document.querySelectorAll('.grid-item');
    const removeGridLineCheckbox = document.getElementById('removeGridLineCheckbox');

    if (removeGridLineCheckbox.checked) {
        gridItems.forEach(item => item.style.boxShadow = 'none'); // Change from 'border' to 'box-shadow'
    } else {
        gridItems.forEach(item => item.style.boxShadow = '0 0 0 1px #ccc'); // Change from 'border' to 'box-shadow'
    }
}

setGridSize(16, 16);