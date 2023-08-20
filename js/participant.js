console.log("vi er i participant.js");
"use strict" //enabler nyere js, ES6 og opefter, du kan ikke bruge uerklærede variabler

const endpoint = "http://localhost:8080/participant"
const endpointBoat = "http://localhost:8080/boat"
const endpointRace = "http://localhost:8080/race"

let fetchedList = []
let boatList = []
let raceList = []
let selectedId


window.addEventListener("load", initApp)

async function initApp() {
    console.log("app is running")
    await updateTable()
    await updateDropdown()

    document.querySelector("#btn-create").addEventListener("click", createClick)
    document.querySelector("#form-create .btn-cancel").addEventListener("click", createCancel)
    document.querySelector("#form-create").addEventListener("submit", createSubmit)
    document.querySelector("#form-update").addEventListener("submit", updateSubmit)
    document.querySelector("#form-update .btn-cancel").addEventListener("click", updateCancelClicked)
    document.querySelector("#form-delete .btn-cancel").addEventListener("click", deleteCancelClicked)
}
//create table, data fetched from db
async function updateTable(){
    document.querySelector("#table tbody").innerHTML = ""
    fetchedList = await get(endpoint)
    sortByName() //gøres før noget vises i tabel, så det altid er sorteret alfabetisk
    console.log(fetchedList)
    createTable(fetchedList)
}
async function updateDropdown(){
    document.querySelector("#create-boat").innerHTML = ""
    document.querySelector("#update-boat").innerHTML = ""
    document.querySelector("#create-race").innerHTML = ""
    document.querySelector("#update-race").innerHTML = ""

    boatList = await get(endpointBoat)
    console.log(boatList)
    raceList = await get(endpointRace)
    console.log(raceList)

    createDropdownBoat(boatList)
    createDropdownRace(raceList)
}
//fetched data som skal displayes i tabel
async function get(endpoint) {
    const response = await fetch(endpoint)
    const data = await response.json() //at omdanne til json returnere også en promise, derfor await først
    console.log(data)
    return data
}
//display tabelrækker og kolonner
function createTable(fetchedList) {
    for (const object of fetchedList) { //for of loop
        const html = `
        <tr>
            <td>${object.participantId}</td>
            <td>${object.point}</td>
            <td>${object.boat.boatType.name}</td>
            <td>${object.boat.name}</td> <!--hvis den siger cannot find name er det fordi der er oprettet child uden parent på-->
            <td>${object.race.date}</td> <!--race virker ikke fordi det er noget på promise, skal hedde noget andet her-->
            <td>
                <button class="btn-delete">Slet</button> <!--kopier "sikker på du vil slette" dialog fra tidligere sps-->
            </td>
            <td>
                <button class="btn-update">Rediger</button>
            </td>
        </tr>`
        document.querySelector("#table tbody").insertAdjacentHTML("beforeend", html)
        document.querySelector("#table tbody tr:last-child .btn-delete") //last-child skal være på ellers sletter den alle objekter
            .addEventListener("click", function(){
                console.log(object)
                showDeleteDialog(object)
            })
        document.querySelector("#table tbody tr:last-child .btn-update")
            .addEventListener("click", function(){
                showUpdateDialog(object)
            })
    }
}
function createDropdownBoat(boatList){
    let html = "";

    for (const object of boatList) {
        //html += /*html*/ `<option value="${object.parent1Id}">${object.name}</option>`;
        const dropdown = document.querySelector("#create-boat")

        const option = document.createElement("option")
        option.innerHTML = object.boatId + " " + object.name
        option.value = JSON.stringify(object)

        dropdown.appendChild(option)
    }
    for (const object of boatList) {
        const dropdown = document.querySelector("#update-boat")

        const option = document.createElement("option")
        option.innerHTML = object.boatId + " " + object.name
        option.value = JSON.stringify(object)

        dropdown.appendChild(option)
    }

    document.querySelector("#create-boat").insertAdjacentHTML("beforeend", html);
    document.querySelector("#update-boat").insertAdjacentHTML("beforeend", html);
}
function createDropdownRace(raceList){
    let html = "";

    for (const object of raceList) {
        const dropdown = document.querySelector("#create-race")

        const option = document.createElement("option")
        option.innerHTML = object.date
        option.value = JSON.stringify(object)

        dropdown.appendChild(option)
    }
    for (const object of raceList) {
        const dropdown = document.querySelector("#update-race")

        const option = document.createElement("option")
        option.innerHTML = object.date
        option.value = JSON.stringify(object)

        dropdown.appendChild(option)
    }

    document.querySelector("#create-race").insertAdjacentHTML("beforeend", html);
    document.querySelector("#update-race").insertAdjacentHTML("beforeend", html);
}

//delete
async function deleteObject(id){
    console.log(id)
    const response = await fetch(`${endpoint}/${id}`, {method:"DELETE"})
    if (response.ok){
        updateTable()
    }
}
//update dialog popup med hentet data om objektet. det her gøres pga closuren, mens form-update-knap-eventlistener er i initApp
function showUpdateDialog(object){
    console.log(object) //her lægger vi ting i felterne
    selectedId = object.participantId //"gemmer" id på selected teacher når man trykker update
    const form = document.querySelector("#form-update")
    form.point.value = object.point
    const boat = document.querySelector("#update-boat option")
    boat.value = JSON.stringify(object.boat)
    boat.innerHTML = object.boat.name

    console.log(object.boat)
    const race = document.querySelector("#update-race option")
    race.value = JSON.stringify(object.race)
    race.innerHTML = object.race.date

    document.querySelector("#dialog-update").showModal()
}
//send det nye for update, kaldes i initApp
function updateSubmit(event){
    event.preventDefault()
    //const form1 = event.currentTarget;
    //const formData = new FormData(form1)
    //update(formData)

    const form = event.target
    const point = form.point.value
    const boat = form.boat.value
    const race = form.race.value //race er promise
    update(selectedId, point, boat, race)
}
//send PUT
async function update(selectedId, point, boat, race){
    document.querySelector("#dialog-update").close() //lukker dialog når man har submitted
    const parsedBoat = JSON.parse(boat) //problemet er at den ikke tager default value ind i dropdown ved update
    const parsedRace = JSON.parse(race)
    console.log(parsedBoat)
    console.log(parsedRace)
    const participantObject = {
        participantId: selectedId,
        point: point,
        boat: parsedBoat,
        race: parsedRace
    }
    const json = JSON.stringify(participantObject)
    console.log(json)

    const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
            "Content-type": "application/json"
        },
        body: json})

    console.log(response)
    if (response.ok) {
        await updateTable()
    }
}
//kaldes i initApp
function createSubmit(event){
    event.preventDefault()
    //const form1 = event.currentTarget;
    //const formData = new FormData(form1)
    //create(formData)

    const form = event.target
    const point = form.point.value
    const boat = form.boat.value
    const race = form.race.value
    create(point, boat, race)
}
//POST
async function create(point, boat, race){
    console.log("boat")
    console.log(boat)
    document.querySelector("#dialog-create").close() //lukker dialog når man har submitted
    const parsedBoat = JSON.parse(boat)
    const parsedRace = JSON.parse(race)
    console.log(parsedBoat)
    console.log(parsedRace)
    const participantObject = {
        point: point,
        boat: parsedBoat,
        race: parsedRace
    }
    const json = JSON.stringify(participantObject)
    console.log(json)

    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: json})

    console.log(response)
    if (response.ok) {
        await updateTable()
    }
}
//sorter alfabetisk
function sortByName(){
    fetchedList.sort((object1, object2) => object1.race.date.localeCompare(object2.race.date))
}
function deleteCancelClicked() {
    document.querySelector("#dialog-delete").close();
}
function updateCancelClicked() {
    document.querySelector("#dialog-update").close();
}

function showDeleteDialog(object){
    selectedId = object.participantId
    //vis navn af person/ting som slettes
    document.querySelector("#dialog-delete-name").textContent = object.boat.name + " " + object.race.date
    // show delete dialog
    document.querySelector("#dialog-delete").showModal()

    document.querySelector("#form-delete").addEventListener("submit", function(){
        deleteObject(object.participantId)
    })
}
function createClick(){
    document.querySelector("#dialog-create").showModal()
}
function createCancel(){
    document.querySelector("#dialog-create").close()
}
