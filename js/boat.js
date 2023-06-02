console.log("vi er i boat.js");
"use strict" //enabler nyere js, ES6 og opefter, du kan ikke bruge uerklærede variabler

const endpoint = "http://localhost:8080/boat"
const endpointBoatType = "http://localhost:8080/boattype"

let fetchedList = []
let parent1List = []
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
    document.querySelector("#create-boattype").innerHTML = ""
    document.querySelector("#update-boattype").innerHTML = ""

    parent1List = await get(endpointBoatType)
    console.log(parent1List)

    createDropdownParent1(parent1List)
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
            <td>${object.boatId}</td>
            <td>${object.name}</td>
            <td>${object.boatType.name}</td> <!--hvis den siger cannot find name er det fordi der er oprettet child uden parent på-->

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
function createDropdownParent1(parent1List){
    let html = "";

    for (const object of parent1List) {
        //html += /*html*/ `<option value="${object.parent1Id}">${object.name}</option>`;
        const dropdown = document.querySelector("#create-boattype")

        const option = document.createElement("option")
        option.innerHTML = object.name
        option.value = JSON.stringify(object)

        dropdown.appendChild(option)
    }
    for (const object of parent1List) {
        //html += /*html*/ `<option value="${object.parent1Id}">${object.name}</option>`;
        const dropdown = document.querySelector("#update-boattype")

        const option = document.createElement("option")
        option.innerHTML = object.name
        option.value = JSON.stringify(object)

        dropdown.appendChild(option)
    }

    document.querySelector("#create-boattype").insertAdjacentHTML("beforeend", html);
    document.querySelector("#update-boattype").insertAdjacentHTML("beforeend", html);
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
    selectedId = object.boatId //"gemmer" id på selected teacher når man trykker update
    const form = document.querySelector("#form-update")
    form.name.value = object.name

    document.querySelector("#dialog-update").showModal()
}
//send det nye for update, kaldes i initApp
function updateSubmit(event){
    event.preventDefault()
    const form = event.target
    const name = form.name.value
    const boatType = form.boatType.value
    console.log(name)
    update(selectedId, name, boatType)
}
//send PUT
async function update(boatId, name, boatType){
    document.querySelector("#dialog-update").close() //lukker dialog når man har submitted
    console.log(boatId)
    const parsedBoatType = JSON.parse(boatType)
    console.log(parsedBoatType)
    const boatObject = {
        boatId: boatId,
        name: name,
        boatType: parsedBoatType,
    }
    const json = JSON.stringify(boatObject)
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
    const form1 = event.currentTarget;

    const formData = new FormData(form1)
    create(formData)

    const form = event.target
    const name = form.name.value
    const boatType = form.boatType.value
    create(name, boatType)
}
//POST
async function create(name, boatType){
    document.querySelector("#dialog-create").close() //lukker dialog når man har submitted
    const parsedBoatType = JSON.parse(boatType)
    console.log(parsedBoatType)
    const boatObject = {
        name: name,
        boatType: parsedBoatType,
    }
    const json = JSON.stringify(boatObject)
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
function sortByName(){ //hvis vi ikke sortere så sorteres det på mærkelig måde af firebase
    fetchedList.sort((object1, object2) => object1.name.localeCompare(object2.name))

    //ikke arrow:
    //teachers.sort(teacher1, teacher2){
    //    return teacher1.name.localeCompare(teacher2.name)
    //}
}
function deleteCancelClicked() {
    document.querySelector("#dialog-delete").close(); // close dialog
}
function updateCancelClicked() {
    document.querySelector("#dialog-update").close(); // close dialog
}

function showDeleteDialog(object){
    // called when delete button is clicked
    selectedId = object.boatId //"gemmer" id på selected teacher når man trykker update
    //vis navn af person/ting som slettes
    document.querySelector("#dialog-delete-name").textContent = object.name
    // show delete dialog
    document.querySelector("#dialog-delete").showModal()

    document.querySelector("#form-delete").addEventListener("submit", function(){
        deleteObject(object.boatId)
    })
}
function createClick(){
    document.querySelector("#dialog-create").showModal()
}
function createCancel(){
    document.querySelector("#dialog-create").close()
}
