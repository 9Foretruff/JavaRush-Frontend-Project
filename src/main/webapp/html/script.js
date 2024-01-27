let accountsCount = null;
let accountPerPage = 3;
let accountsAmount = null;
let currentPageNumber = 0;

createAccountPerPageDropDown()
fillTable(currentPageNumber, accountPerPage)
updatePlayersCount()

function fillTable(pageNumber, pageSize) {

    $.get(`http://localhost:8084/rest/players?pageNumber=${pageNumber}&pageSize=${pageSize}`, (players) => {
        console.log(players)

        const $playersTableBody = $('.players-table-body')[0];
        let htmlRows = '';

        players.forEach((player) => {
            htmlRows +=
                `<tr class="row" data-account-id="${player.id}">
                    <td class="cell cell_small"> ${player.id}</td>
                    <td class="cell" data-account-name> ${player.name}</td>
                    <td class="cell" data-account-title> ${player.title}</td>
                    <td class="cell" data-account-race> ${player.race}</td>
                    <td class="cell" data-account-profession> ${player.profession}</td>
                    <td class="cell" data-account-level> ${player.level}</td>
                    <td class="cell" data-account-birthday> ${new Date(player.birthday).toLocaleDateString()}</td>
                    <td class="cell" data-account-banned> ${player.banned}</td>
                    <td class="cell cell-auto"> 
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
        })

        Array.from($playersTableBody.children).forEach(row => row.remove())

        $playersTableBody.insertAdjacentHTML('beforeend', htmlRows)

        const deleteButtons = document.querySelectorAll('.delete-button');
        deleteButtons.forEach(button => button.addEventListener('click', removeAccountHandler))

        const editButtons = document.querySelectorAll('.edit-button');
        editButtons.forEach(button => button.addEventListener('click', editAccountHandler))
    })

}

function updatePlayersCount() {
    $.get('rest/players/count', (count) => {
        accountsCount = count;
        updatePaginationButtons()
    })
}

function updatePaginationButtons() {
    accountsAmount = accountsCount ? Math.ceil(accountsCount / accountPerPage) : 0
    const $buttonsContainer = document.querySelector('.pagination-buttons');
    let childButtonsCount = $buttonsContainer.children.length;

    let paginationButtonsHtml = '';

    for (let i = 1; i <= accountsAmount; i++) {
        paginationButtonsHtml += '<button value="' + (i - 1) + '">' + i + '</button>'
    }

    if (childButtonsCount !== 0) {
        Array.from($buttonsContainer.children).forEach(node => node.remove())
    }

    $buttonsContainer.insertAdjacentHTML('beforeend', paginationButtonsHtml)
    Array.from($buttonsContainer.children).forEach(button => button.addEventListener('click', onPageChange))
    setActiveButton(currentPageNumber)
}

function createAccountPerPageDropDown() {
    const $dropDown = document.querySelector('.account-per-page');
    const options = createSelectOptions([3, 5, 10, 20], 3)
    $dropDown.addEventListener('change', onAccountPerPageChangeHandler)
    $dropDown.insertAdjacentHTML('afterbegin', options)
}

function createSelectOptions(optionsArray, defaultValue) {
    let optionHtml = '';

    optionsArray.forEach(option => optionHtml += `<option ${defaultValue === option && 'selected'} value="${option}">${option}</option>`)

    return optionHtml
}

function onAccountPerPageChangeHandler(e) {
    accountPerPage = e.currentTarget.value;
    fillTable(currentPageNumber, accountPerPage)
    updatePaginationButtons();
}

function onPageChange(e) {
    const targetPageIndex = e.currentTarget.value;
    setActiveButton(targetPageIndex)

    currentPageNumber = targetPageIndex;
    fillTable(currentPageNumber, accountPerPage)
    setActiveButton(currentPageNumber);
}

function setActiveButton(buttonIndex = 0) {
    const $buttonsContainer = document.querySelector('.pagination-buttons');
    const $targetButton = Array.from($buttonsContainer.children)[buttonIndex];
    const $currentActiveButton = Array.from($buttonsContainer.children)[currentPageNumber];

    $currentActiveButton.classList.remove('active-pagination-button')
    $targetButton.classList.add('active-pagination-button')
}

function removeAccountHandler(e) {
    const accountId = e.currentTarget.value;

    $.ajax({
        url: `/rest/players/${accountId}`,
        type: 'DELETE',
        success: function () {
            updatePlayersCount()
            fillTable(currentPageNumber, accountPerPage)
        }
    })
}

function editAccountHandler(e) {
    const accountId = e.currentTarget.value;

    const $currentRow = document.querySelector(`.row[data-account-id='${accountId}']`);
    const $currentRemoveButton = $currentRow.querySelector('.delete-button');
    const $currentImage = $currentRow.querySelector('.edit-button img');

    const $currentName = $currentRow.querySelector('[data-account-name]');
    const $currentTitle = $currentRow.querySelector('[data-account-title]');
    const $currentRace = $currentRow.querySelector('[data-account-race]');
    const $currentProfession = $currentRow.querySelector('[data-account-profession]');
    const $currentBanned = $currentRow.querySelector('[data-account-banned]');

    $currentImage.src = "../img/save.png"

    $currentName.childNodes[0].replaceWith(createInput($currentName.innerHTML))
    $currentTitle.childNodes[0].replaceWith(createInput($currentTitle.innerHTML))
    $currentRace.childNodes[0].replaceWith(createInput($currentRace.innerHTML))
    $currentProfession.childNodes[0].replaceWith(createInput($currentProfession.innerHTML))
    $currentBanned.childNodes[0].replaceWith(createInput($currentBanned.innerHTML))
}


function createInput(value) {
    const $htmlInputElement = document.createElement('input');

    $htmlInputElement.setAttribute('type', 'text')
    $htmlInputElement.setAttribute('value', value)
    $htmlInputElement.setAttribute('data-value', value)

    $htmlInputElement.addEventListener('input', e => {
        $htmlInputElement.setAttribute('data-value', `${e.currentTarget.value}`)
    })

    return $htmlInputElement

}
