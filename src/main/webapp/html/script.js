let playersCount = 0;
let playersPerPage = 3;
let pagesCount = 0;
let currentPageNumber = 0;

const RACE_ARRAY = ['HUMAN', 'DWARF', 'ELF', 'GIANT', 'ORC', 'TROLL', 'HOBBIT'];
const PROFESSION_ARRAY = ['WARRIOR', 'ROGUE', 'SORCERER', 'CLERIC', 'PALADIN', 'NAZGUL', 'WARLOCK', 'DRUID'];
const BANNED_ARRAY = ['true', 'false'];

initCreateForm();
createAccountPerPageSelect()
fillTable(currentPageNumber, playersPerPage)
updatePlayersCount();

function initCreateForm() {
    let $raceSelect = document.querySelector('[data-create-race]');
    let $professionSelect = document.querySelector('[data-create-profession]');
    let $bannedSelect = document.querySelector('[data-create-banned]');

    $raceSelect.insertAdjacentHTML('afterbegin', createSelectOptions(RACE_ARRAY, RACE_ARRAY[0]));
    $professionSelect.insertAdjacentHTML('afterbegin', createSelectOptions(PROFESSION_ARRAY, PROFESSION_ARRAY[0]));
    $bannedSelect.insertAdjacentHTML('afterbegin', createSelectOptions(BANNED_ARRAY, BANNED_ARRAY[0]));
}

function fillTable(pageNumber, pageSize) {
    $.get(`/rest/players?pageNumber=${pageNumber}&pageSize=${pageSize}`, (players) => {

        let $playersTableBody = $('.players-table-body')[0];
        let htmlRows = '';

        players.forEach((player) => {
            htmlRows +=
                `<tr class="row" data-account-id="${player.id}">
                    <td class="cell">${player.id}</td>
                    <td class="cell" data-account-name>${player.name}</td>
                    <td class="cell" data-account-title>${player.title}</td>
                    <td class="cell" data-account-race>${player.race}</td>
                    <td class="cell" data-account-profession>${player.profession}</td>
                    <td class="cell" data-account-level>${player.level}</td>
                    <td class="cell" data-account-birthday>${new Date(player.birthday).toLocaleDateString()}</td>
                    <td class="cell" data-account-banned>${player.banned}</td>
                    <td class="cell">
                        <button class="edit-button" value="${player.id}">
                            <img class="edit-image" src="../img/edit.png" alt="edit">
                        </button>
                    </td>
                    <td class="cell">
                        <button class="delete-button" value="${player.id}">
                            <img class="delete-image" src="../img/delete.png" alt="delete">
                        </button>
                    </td>
                </tr>`
        });

        Array.from($playersTableBody.children).forEach(row => row.remove());
        $playersTableBody.insertAdjacentHTML('beforeend', htmlRows);

        let $deleteButtons = document.querySelectorAll('.delete-button');
        $deleteButtons.forEach(button => button.addEventListener('click', deleteAccount));

        let $editButtons = document.querySelectorAll('.edit-button');
        $editButtons.forEach(button => button.addEventListener('click', editAccount));
    });
}

function updatePlayersCount() {
    $.get(`/rest/players/count`, (count) => {
        playersCount = count;
        updatePaginationButtons();
    });
}

function updatePaginationButtons() {
    pagesCount = playersCount ? Math.ceil(playersCount / playersPerPage) : 0;
    let $buttonsContainer = $('.pagination-buttons')[0];
    let childButtonsCount = $buttonsContainer.children.length;

    let paginationButtonsHtml = '';
    for (let i = 0; i < pagesCount; i++) {
        paginationButtonsHtml += `<button value="${i}" class="button">${i + 1}</button>`;
    }

    if (childButtonsCount !== 0) {
        Array.from($buttonsContainer.children).forEach(node => node.remove());
    }

    $buttonsContainer.insertAdjacentHTML('beforeend', paginationButtonsHtml);
    Array.from($buttonsContainer.children).forEach(button => button.addEventListener('click', changeAccountsOnPage));
    setActivePageButton(currentPageNumber);
}

function changeAccountsOnPage(element) {
    let targetPageIndex = element.currentTarget.value;
    setActivePageButton(targetPageIndex);
    currentPageNumber = targetPageIndex;
    fillTable(currentPageNumber, playersPerPage);
    setActivePageButton(currentPageNumber);
}

function changeAccountsPerPage(element) {
    playersPerPage = element.currentTarget.value;
    fillTable(currentPageNumber, playersPerPage);
    updatePaginationButtons();
}

function createAccountPerPageSelect() {
    let $select = $('.accounts-per-page')[0];
    let options = createSelectOptions([3, 5, 10, 20], 3);
    $select.addEventListener('change', changeAccountsPerPage);
    $select.insertAdjacentHTML('afterbegin', options);
}


function setActivePageButton(activePageButtonIndex) {
    let $buttonsContainer = $('.pagination-buttons')[0];
    let $targetButton = Array.from($buttonsContainer.children)[activePageButtonIndex];
    let $currentActiveButton = Array.from($buttonsContainer.children)[currentPageNumber];
    $currentActiveButton.classList.remove('active-button');
    $targetButton.classList.add('active-button');
}

function deleteAccount(element) {
    let accountId = element.currentTarget.value;
    $.ajax({
        url: `rest/players/${accountId}`,
        type: 'DELETE',
        success: function () {
            updatePlayersCount();
            fillTable(currentPageNumber, playersPerPage);
        }
    });
}

function editAccount(element) {
    let accountId = element.currentTarget.value;
    let $currentRow = document.querySelector(`.row[data-account-id='${accountId}']`);

    let $currentDeleteButton = $currentRow.querySelector('.delete-button');
    let $currentName = $currentRow.querySelector('[data-account-name]');
    let $currentTitle = $currentRow.querySelector('[data-account-title]');
    let $currentRace = $currentRow.querySelector('[data-account-race]');
    let $currentProfession = $currentRow.querySelector('[data-account-profession]');
    let $currentBanned = $currentRow.querySelector('[data-account-banned]');
    let $currentImage = $currentRow.querySelector('.edit-button img');

    $currentImage.src = "../img/save.png";
    $currentImage.addEventListener('click', () => {
        let params = {
            accountId: accountId,
            data: {
                name: $currentName.childNodes[0].getAttribute('data-value'),
                title: $currentTitle.childNodes[0].getAttribute('data-value'),
                race: $currentRace.childNodes[0].getAttribute('data-value'),
                profession: $currentProfession.childNodes[0].getAttribute('data-value'),
                banned: $currentBanned.childNodes[0].getAttribute('data-value')
            }
        }
        console.log(params);
        updateAccount(params);
    });
    $currentDeleteButton.classList.add('hidden');

    $currentName.childNodes[0].replaceWith(createInput($currentName.innerHTML));
    $currentTitle.childNodes[0].replaceWith(createInput($currentTitle.innerHTML));
    $currentRace.childNodes[0].replaceWith(createSelect(RACE_ARRAY, $currentRace.innerHTML));
    $currentProfession.childNodes[0].replaceWith(createSelect(PROFESSION_ARRAY, $currentProfession.innerHTML));
    $currentBanned.childNodes[0].replaceWith(createSelect(BANNED_ARRAY, $currentBanned.innerHTML));
}

function updateAccount({accountId, data}) {
    $.ajax({
        url: `/rest/players/${accountId}`,
        type: 'POST',
        data: JSON.stringify(data),
        dataType: "json",
        contentType: "application/json",
        success: function () {
            updatePlayersCount();
            fillTable(currentPageNumber, playersPerPage);
        }
    });
}

function createAccount() {
    let data = {
        name: document.querySelector('[data-create-name]').value,
        title: document.querySelector('[data-create-title]').value,
        race: document.querySelector('[data-create-race]').value,
        profession: document.querySelector('[data-create-profession]').value,
        level: document.querySelector('[data-create-level]').value,
        birthday: new Date(document.querySelector('[data-create-birthday]').value).getTime(),
        banned: document.querySelector('[data-create-banned]').value
    }

    $.ajax({
        url: `/rest/players/`,
        type: 'POST',
        data: JSON.stringify(data),
        dataType: "json",
        contentType: "application/json",
        success: function () {
            updatePlayersCount();
            fillTable(currentPageNumber, playersPerPage);
            resetForm();
        }
    });
}

function createInput(value) {
    let $htmlInputElement = document.createElement('input');
    $htmlInputElement.setAttribute('type', 'text');
    $htmlInputElement.setAttribute('value', value);
    $htmlInputElement.setAttribute('data-value', value);

    $htmlInputElement.addEventListener('input', element => {
        $htmlInputElement.setAttribute('data-value', `${element.currentTarget.value}`);
    })
    return $htmlInputElement;
}

function createSelect(optionsArray, defaultValue) {
    let $options = createSelectOptions(optionsArray, defaultValue);
    let $selectElement = document.createElement('select');
    $selectElement.insertAdjacentHTML('afterbegin', $options);
    $selectElement.setAttribute('data-value', defaultValue);
    $selectElement.addEventListener('change', element => {
        $selectElement.setAttribute('data-value', `${element.currentTarget.value}`);
    })
    return $selectElement;
}

function createSelectOptions(optionsArray, defaultValue) {
    let optionHtml = '';
    optionsArray.forEach((option) => {
        optionHtml +=
            `<option ${defaultValue === option && "selected"} value="${option}">
                ${option}
             </option>`
    });
    return optionHtml;
}

function resetForm() {
    let $formContainer = document.querySelector('.form');
    Array.from($formContainer.children).forEach(node => node.remove());
    let htmlFormElements = `<h2>Create new account:</h2>
    <div class="create-field">
        <label for="create-name-input">Name:</label>
        <input id="create-name-input" type="text" data-create-name>
    </div>
    <div class="create-field">
        <label for="create-title-input">Title:</label>
        <input id="create-title-input" type="text" data-create-title>
    </div>
    <div class="create-field">
        <label for="create-race-select">Race:</label>
        <select id="create-race-select" data-create-race></select>
    </div>
    <div class="create-field">
        <label for="create-profession-select">Profession:</label>
        <select id="create-profession-select" data-create-profession></select>
    </div>
    <div class="create-field">
        <label for="create-level-input">Level:</label>
        <input id="create-level-input" type="text" data-create-level>
    </div>
    <div>
        <label for="create-birthday-input">Birthday:</label>
        <input id="create-birthday-input" type="date" data-create-birthday>
    </div>
    <div class="create-field">
        <label for="create-banned-select">Banned:</label>
        <select id="create-banned-select" data-create-banned></select>
    </div>
    <button class="save-button" onclick="createAccount()">
        <img class="save-image" src="../img/save.png" alt="save">
    </button>`;
    $formContainer.insertAdjacentHTML('beforeend', htmlFormElements);
    initCreateForm();
}