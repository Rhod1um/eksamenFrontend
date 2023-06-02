console.log("vi er i overview.js");
"use strict"
const endpointBoatGet = "http://localhost:8080/boat"

const endpointMember = "http://localhost:8080/member/count"
const endpointRace = "http://localhost:8080/race/count"
const endpointBoatType = "http://localhost:8080/boattype/count"
const endpointBoat = "http://localhost:8080/boat/count"
const endpointParticipant = "http://localhost:8080/participant/count"
let countMember
let countRace
let countBoatType
let countBoat
let countParticipant

const endpointParticipantPoint = "http://localhost:8080/participant/point/2"
let point

let boatList = []
let sumPoint = []

window.addEventListener("load", initApp)

async function initApp() {
    console.log("app is running")

    countMember = await get(endpointMember)
    countRace = await get(endpointRace)
    countBoatType = await get(endpointBoatType)
    countBoat = await get(endpointBoat)
    displayCounts()

    boatList = await get(endpointBoatGet)
    let boatIds = boatList.map(boat => boat.boatId);

    console.log("point")
    await get(endpointParticipantPoint)
}

function displayCounts(){
    const html = `
        <tr>
            <td>${countMember}</td>
            <td>${countRace}</td>
            <td>${countBoat}</td> <!--hvis den siger cannot find name er det fordi der er oprettet child uden parent på-->
            <td>${countBoatType}</td>
        </tr>`
    document.querySelector("#count-table tbody").insertAdjacentHTML("beforeend", html)
}

async function get(endpoint){
    const response = await fetch(endpoint)
    const data = await response.json() //at omdanne til json returnere også en promise, derfor await først
    console.log(data)
    return data
}



