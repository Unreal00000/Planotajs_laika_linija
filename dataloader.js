// "name" un "description" izsaka kā simbolu virkni (string)
// datumam "date" izmanto Unix Time Stamp un gadījumā, ja tas netiek ievadīts, lieto null
// apzīmētājam "tag" izmanto simbolu virkņu masīvu
const demoData = [
    {"name":"KD programmēšanā","date":1773798400,"tag":["Kontroldarbs"],"description":"Jāpabeidz projekts ar gatavām testējamām funkcijām!"},
    {"name":"KD matemātikā","date":1773898400,"tag":["Kontroldarbs", "Mājas darbs", "Skola"],"description":"Atvasināšana, funkcijas ekstrēmu noteikšana. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. "},
    {"name":"Literatūra, pērļu zvejnieks","date":null,"tag":["Mājas darbs"],"description":"Pabeigt lasīt 'Pērļu zvejnieku'"},
    {"name":"Pica!","date":1774017582,"tag":[],"description":"Picas ballīte piektdienā!"},
    {"name":"ZPD aizstāvēšana","date":1773352800,"tag":["Skola"],"description":""},
    {"name":"Kamermūzikas vakars","date":null,"tag":["Mājas darbs","Skola"],"description":"Gatavoties kamermūzikas vakaram."},
]
// saglabāti apzīmētāji un tiem atbilstošās krāsas
const demoColors = {
    "No tag":"rgb(0, 0, 0)", // "No tag" nav pievienojams vai nodzēšams, bet tā krāsa ir rediģējama
    "Kontroldarbs":"rgb(255,0,0)",
    "Mājas darbs":"rgb(0,166,255)",
    "Skola":"rgb(102,0,255)",
}

var data = demoData
var tagColors = demoColors

const timelineContainer = document.getElementById("timelineContainer");
const relevantContainer = document.getElementById("relevantContainer");
const todayContainer = document.getElementById("todayContainer");

var data = []
var tagColors = {
    "No tag":"rgb(0, 0, 0)"
}



// nodrošina, ka viss tiek ielādēts atverot tīmekļa vietni
document.addEventListener("DOMContentLoaded", function () {
    loadTimeline(data_T, calendarDays)
    loadRelevant(data_R)
    loadToday()
})

// ielādē laika līniju
function loadTimeline(tasks, calendarDays, filterType, filterDirection, filterTags) {
    let days = [...calendarDays]

    if (firstTime_T) {
        timelineContainer.addEventListener('wheel', transformScroll)
        firstTime_T = false
    } else {
        // atbrīvojas no iepriekš ielādētiem datiem un informācijas
        todayTaskBox = []
        while (timelineContainer.hasChildNodes()) {
            timelineContainer.removeChild(timelineContainer.firstChild)
            console.log(1)
        }
    }

    var greenLight = true

    if (filterType === "tasks") {
        // tiek ielādēti tikai notikumi
        days = tasks
    } else {
        tasks.forEach(item => {
            // pārbauda, vai vismaz 1 apzīmētājs notikumā sakrīt ar filtru
            if (filterTags) {
                greenLight = false
                item.tag.forEach(function (tag) {
                    if (filterTags.includes(tag)) {
                        greenLight = true
                    }
                })
            }

            if (greenLight) {
                // ievieto notikumus dienās
                var index = days.findIndex(day => (day <= item.date && (day + 86400) > item.date))

                if (index !== -1) {
                    days[index] = item
                } else {
                    index = days.findIndex(day => (day.date <= item.date && (day.date + 86400) > item.date))
                    if (index !== -1) {
                        days.splice(index + 1, 0, item)
                    }
                }
            }
        })
    }
    greenLight = true

    if (filterDirection === "reverse") {
        // apvērš dienu secību
        days = days.reverse()
    }
    // uztaisa objektus
    days.forEach(function (item) {
        TLE = document.createElement("button")
        TLE.setAttribute("class", "timelineElement")
        var itemType
        var position

        // izšķir objektus pa notikumiem un parastajām dienām, maina dažus dizaina elementus, ja nepieciešams
        if (typeof item === "object") {
            let d = new Date(item.date * 1000)
            let text = d.toString().slice(0, 15)

            TLE_D = document.createElement("div")
            TLE_D.textContent = text
            TLE_D.setAttribute("class", "timelineElement_date")

            TLE.textContent = item.name
            TLE.style.width = "20%"
            TLE.appendChild(TLE_D)
            itemType = "task"
        } else if (typeof item === "number") {
            let d = new Date(item * 1000)
            let text = d.toString().slice(0, 15)

            TLE.textContent = text
            TLE.style.fontWeight = "normal"
            TLE.style.fontSize = "16px"
            itemType = "day"
        }

        // nosaka vai objekts atrodas pagātnē vai tagadnē
        if (itemType === "task") {
            addTagColor(item, TLE)
            if (item.date < todayUnix) {
                position = "past"
            } else if (todayUnix <= item.date && (todayUnix + 86400) > item.date) {
                position = "today"
                todayTask.push(item)
            }
        } else if (itemType === "day") {
            if (item < todayUnix) {
                position = "past"
            } else if (item === todayUnix) {
                position = "today"
            }
        }
        // atbilstoši maina dizainu
        if (position === "past") {
            TLE.setAttribute("class", "timelineElement_past")
        } else if (position === "today") {
            TLE.setAttribute("class", "timelineElement_today")
            let tempVar = TLE
            todayTaskBox.push(tempVar)
            requestAnimationFrame(() => {
                timelineContainer.scrollLeft = todayTaskBox[0].offsetLeft - timelineContainer.clientWidth / 4 + todayTaskBox[0].clientWidth / 2
            })
        }
        // pievieno objektus tilpnei
        document.getElementById("timelineContainer").appendChild(TLE)
    })
}

// ielādē aktuālos notikumus
function loadRelevant(tasks, filterTags) {
    if (firstTime_R) {
        relevantContainer.addEventListener('wheel', transformScroll)
        firstTime_R = false
    } else {
        // atbrīvojas no iepriekš ielādētiem datiem un informācijas
        while (relevantContainer.hasChildNodes()) {
            relevantContainer.removeChild(relevantContainer.firstChild)
        }
    }

    var greenLight = true

    tasks.forEach(function (item) {
        // pārbauda, vai vismaz 1 apzīmētājs notikumā sakrīt ar filtru
        if (filterTags) {
            greenLight = false
            item.tag.forEach(function (tag) {
                if (filterTags.includes(tag)) {
                    greenLight = true
                }
            })
        }
        if (greenLight) {
            // uztaisa un pievieno objektus tilpnei
            RE = document.createElement("button")
            RE.textContent = item.name
            RE.setAttribute("class", "relevantElement")
            addTagColor(item, RE)
            document.getElementById("relevantContainer").appendChild(RE)
        }
        greenLight = true
    })
}

// ielādē šodienas notikumu papildinformāciju
function loadToday() {
    // atbrīvojas no iepriekš ielādētiem datiem un informācijas
    while (todayContainer.hasChildNodes()) {
        todayContainer.removeChild(todayContainer.firstChild)
    }
    // pievieno tukšu objektu, kā daudzfunkcionālu atkāpi
    function addBlank () {
        TDE_blank = document.createElement("div")
        TDE_blank.setAttribute("class", "todayElement_blank")
        document.getElementById("todayContainer").appendChild(TDE_blank)
    }
    addBlank()
    // pievieno notikuma nosaukuma virsrakstu
    function addHeader (text, tags) {
        TDE_H = document.createElement("div")
        TDE_H.setAttribute("class", "todayElement_headerContainer")
        // pievieno apzīmētājiem atbilstošās krāsu dekorācijas. True = secīgi, false = apgrieztā secībā
        function addDecor (bool) {
            D1 = document.createElement("div")
            D1.setAttribute("class", "todayDecoration_1")

            var usedTags = []
            var tagsArray
            if (bool) {
                tagsArray = tags
            } else {
                tagsArray = tags.reverse()
            }

            if (tagsArray.length > 0) {
                tagsArray.forEach(function (tag) {
                    // pārbauda vai lieki neatkārtojas apzīmētāji
                    if (usedTags.includes(tag)) {
                        // brīdināšana jau tiek veikta addTagColor() funkcijā
                        return
                    }

                    TE = document.createElement("div")
                    TE.setAttribute("class", "tagElement")

                    // pārbauda vai apzīmētājam ir atbilstoša krāsa
                    if (tagColors[tag]) {
                        TE.style.backgroundColor = tagColors[tag]
                        D1.appendChild(TE)
                    } else {
                        // brīdināšana jau tiek veikta addTagColor() funkcijā
                        TE.remove()
                    }

                    usedTags.push(tag)
                })
            } else {
                if (tagColors["No tag"]) {
                    D1.style.backgroundColor = tagColors["No tag"]
                } else {
                    D1.style.backgroundColor = "rgb(0, 0, 0)"
                }
            }

            TDE_H.appendChild(D1)
        }

        // objekti virsrakstā
        addDecor(true)
        TDE_HC = document.createElement("div")
        TDE_HC.textContent = text
        TDE_HC.setAttribute("class", "todayElement_header")
        TDE_H.appendChild(TDE_HC)
        addDecor(false)

        document.getElementById("todayContainer").appendChild(TDE_H)
    }
    // šeit notiek pati ielādēšanas daļa šodienas notikumiem
    if (todayTask.length > 0) {
        todayTask.forEach(function (item) {
            addHeader(item.name, item.tag)

            if (item.description && item.description.length > 0) {
                TDE_T = document.createElement("div")
                TDE_T.textContent = item.description
                TDE_T.setAttribute("class", "todayElement_text")
                document.getElementById("todayContainer").appendChild(TDE_T)
            }
            addBlank()
        })
    } else {
        addHeader("Šodien notikumu nav!")
    }

    todayTask = []
}

// pievieno apzīmētājiem atbilstošas krāsas notikumu objektiem
function addTagColor (item, element) {
    TC = document.createElement("div")
    TC.setAttribute("class", "tagContainer")
    element.appendChild(TC)

    var usedTags = []

    if (item.tag.length > 0) {
        item.tag.forEach(function (tag) {
            // pārbauda vai lieki neatkārtojas apzīmētāji
            if (usedTags.includes(tag)) {
                console.warn("Repeat tag -> " + tag)
                return
            }

            TE = document.createElement("div")
            TE.setAttribute("class", "tagElement")

            // pārbauda vai apzīmētājam ir atbilstoša krāsa
            if (tagColors[tag]) {
                TE.style.backgroundColor = tagColors[tag]
                TC.appendChild(TE)
            } else {
                console.warn("no tag color for tag -> " + tag)
                TE.remove()
            }

            usedTags.push(tag)
        })
    } else {
        if (tagColors["No tag"]) {
            TC.style.backgroundColor = tagColors["No tag"]
        } else {
            TC.style.backgroundColor = "rgb(0, 0, 0)"
        }
    }
}

// filtrē notikumus. Methods: "" vai "tasks", directions: "" vai "reverse", tags: ["Apzīmētājs 1", "Apzīmētājs 2" utt.]
function filterTimeline (method, direction, tags) {
    if (direction !== "reverse") {
        direction = "normal"
    }

    if (!method || method === "" || method === "default") {
        method = "default"
    }
    // apakšfunkcija, lai samazinātu koda garumu, ielādē par jaunu notikumus
    function filterTimeline_2 () {
        loadTimeline(data_T, calendarDays, method, direction)
        loadRelevant(data_R)
        loadToday()
    }
    // pārbaude atlasītajiem apzīmētāju filtriem
    if (tags && tags.length > 0) {
        var validTags = []
        tags.forEach(function (tag) {
            if (tagColors[tag]) {
                validTags.push(tag)
            }
        })
        if (validTags.length > 0) {
            loadTimeline(data_T, calendarDays, method, direction, validTags)
            loadRelevant(data_R, validTags)
            loadToday()
        } else {
            filterTimeline_2()
        }
    } else {
        filterTimeline_2()
    }

}

// palaist filtrēšanas funkciju 3 sekundes pēc lapas ielādēšanas
// setTimeout(() => {
//     filterTimeline("default", "normal", ["Skola"])
//     console.log("Executed after 3 seconds")
// }, 3000)