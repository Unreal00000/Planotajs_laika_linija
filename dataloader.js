/* file:           dataloader.js
 * last changed:   12.03.2026
 * description:    Design related functions
*/
// demonstrācijas dati jeb kā dati tiks sakārtoti
// datumam izmanto Unix Time Stamp
const demoData = [
    {"name":"KD programmēšanā","date":1773758382,"tag":["Kontroldarbs"],"description":"Jāpabeidz projekts ar gatavām testējamām funkcijām!"},
    {"name":"KD matemātikā","date":1773844782,"tag":["Kontroldarbs"],"description":"Atvasināšana, funkcijas ekstrēmu noteikšana."},
    {"name":"Literatūra, pērļu zvejnieks","date":null,"tag":["Mājas darbs"],"description":"Pabeigt lasīt 'Pērļu zvejnieku'"},
    {"name":"Pica!","date":1774017582,"tag":[null],"description":"Picas ballīte piektdienā!"},
    {"name":"ZPD aizstāvēšana","date":1772807982,"tag":["Skola"],"description":null},
    {"name":"Kamermūzikas vakars","date":null,"tag":["Mājas darbs","Skola"],"description":"Gatavoties kamermūzikas vakaram."},
]

var data = demoData

var data_TR = seperateAndSortData(data)
var data_T = data_TR[0]
var data_R = data_TR[1]

const daysPast = 365
const daysFuture = 365
const today  = new Date()
const todayUnix = Math.floor(today.getTime() / 1000)
const calendarDays =  generateDays(daysPast, daysFuture)

function seperateAndSortData(data) {
    var data_t = data.filter(item => item.date)
    var data_r = data.filter(item => !item.date)

    data_t.sort((a, b) => a.date - b.date)

    return [data_t, data_r]
}

function generateDays(daysPast, daysFuture) {
    const result = []

    for (let i = -daysPast; i <= daysFuture; i++) {
        const d = new Date(today)
        d.setDate(today.getDate() + i)
        result.push(Math.floor(d.getTime() / 1000))
    }

    return result
}

function transformScroll(event) {
    if (!event.deltaY) {
        return
    }

    event.currentTarget.scrollLeft += event.deltaY + event.deltaX
    event.preventDefault()
}

document.addEventListener("DOMContentLoaded", function () {
    loadTimeline(data_T, calendarDays)
    loadRelevant(data_R)
})

function loadTimeline(tasks, days) {

    timelineContainer.addEventListener('wheel', transformScroll)

    tasks.forEach(item => {
        const index = days.findIndex(day => (day < item.date && (day + 86400) > item.date))

        if (index !== -1) {
            days[index] = item
        }
    })

    days.forEach(function (item) {
        TLE = document.createElement("button")
        TLE.setAttribute("class", "timelineElement")
        var itemType
        var position

        if (typeof item == "object") {
            TLE.textContent = item.name
            TLE.style.width = "20%"
            itemType = "task"
        } else if (typeof item == "number") {
            TLE.textContent = item
            itemType = "day"
        }

        if (itemType == "task") {
            if (item.date < todayUnix) {
                position = "past"
            } else if (todayUnix < item.date && (todayUnix + 86400) > item.date) {
                position = "today"
            }
        } else if (itemType == "day") {
            if (item < todayUnix) {
                position = "past"
            } else if (item == todayUnix) {
                position = "today"
            }
        }

        if (position == "past") {
            TLE.setAttribute("class", "timelineElement_past")
        } else if (position == "today") {
            TLE.setAttribute("class", "timelineElement_today")
        }

        document.getElementById("timelineContainer").appendChild(TLE)
    })
    // jāsakārto
    timelineContainer.scrollLeft = daysPast * 0.0428 * window.innerWidth
}

function loadRelevant(tasks) {

    relevantContainer.addEventListener('wheel', transformScroll)

    tasks.forEach(function (item) {
        RE = document.createElement("button")
        RE.textContent = item.name
        RE.setAttribute("class", "relevantElement")
        document.getElementById("relevantContainer").appendChild(RE)
    })
}