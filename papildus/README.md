| **Vārds** | **Uzvārds** |
|:---------:|:-----------:|
|  Mārcis   | Aizpurietis |
|  Roberts  |    Smila    |

| **Formāts:** | Mobilā (tīkla) lietotne |
|--------------|-----------------------|

## Apraksts

Mācības skolā un paralēlas aktivitātes nozīmē lielu daudzumu darbu un uzdevumu, kam jāatvēl un jāieplāno laiks. Lai šiem darbiem varētu vienkārši izsekot, mēs plānojam izstrādāt plānotāja web-aplikāciju ar parocīgām funkcijām.
Plānotājs būtu pieejams no interneta pārlūka, lietotājam pieslēzoties ar lietotājvārdu un paroli. Tas ļautu lietotājam pievienot “notikumus” ar noteiktu datumu, “apzīmētāju” un aprakstu. Galvenokārt visus “notikumus” būtu iespējams aplūkot secīgi pēc to datumiem, bet, ja datuma aile tiktu atstāta tukša, “notikums” tiktu attēlots atsevišķi no pārējā saraksta, kā uzdevums, kas veicams steidzami / neatkarīgi no datuma. Izvēloties “apzīmētāju” lietotājam būtu opcija izveidot jaunu “apzīmētāju” vai izvēlēties kādu no esošajiem, iepriekš izgatavotajiem “apzīmētājiem”. “Notikuma” “apzīmētājs” norādā, kādā kategorijā “notikums” ietilpst, un sastāvētu no teksta un vienas krāsas atvieglotai atpazīstamībai, kā, piemēram, 🔴Pārbaudes darbs vai 🔵Tikšanās. Lietotājam tiktu dota iespēja “filtrēt” notikumus pēc to “apzīmētājiem”, lai redzētu tikai tuvākos pārbaudes darbus vai tuvākās tikšanās, kā jau minēts, datumu secībā. Visbeidzot “notikumus” būtu iespējams noņemt no saraksta vai nu manuāli, vai arī sagaidot, kad atzīmētais datums būs pagājis. Noņemtie “notikumi” tiktu novietoti atsevišķā sarakstā - atkritnē / arhīvā -, kas lietotājam arī būtu pieejams.
Iespējamas papild-funkcijas, kas nav daļa no galvenā plāna / primārās plānotāja idejas:
Prioritātes iestatījums katram “notikumam” (cik tas ir svarīgs) vai kāds cits veids, kā lietotājam manuāli sakārtot pagaidu sarakstu, kurā norādīts, kas jādara pirmais un kas var uzgaidīt.
Opcija rādīt / slēpt tukšās kalendāra dienas starp “notikumiem”, lai ļautu lietotājam labāk vizualizēt pieejamo laiku starp “notikumiem”.
Rādīt nedēļas dienu (pirmdiena, otrdiena, trešdiena…) blakus datumam.
Iespēja saskaņot plānus ar citiem litotājiem, automātiski salīdzinot, kuras dienas ir brīvas un kuras aizņemtas, kā arī, iespējams, ņemot vērā “notikumu” prioritātes, lai atrastu dienu, kurā abi / visi varētu satikties vai kaut ko kopā iesākt.
Iespēja pieslēgties plānotājam no aplikācijas uz mobilās ierīces.

## Darba plāns

| **Izmantotās tehnoloģijas** |
|:----------------------------|
| REACT                       |
| NODEJS                      |
| WebStorm                    |
| MySQL?                      |
| Docker?                     |



| **Konceptuālais modelis:** | ![Sequence_diagram](Konceptuālais_modelis_1.png) |
|:--------------------------:|:-------------------------------------------------|

| **Nedēļa** |   **Datums**    | **Uzdevums**                                                                                                               | **Darītājs** |
|:----------:|:---------------:|:---------------------------------------------------------------------------------------------------------------------------|:------------:|
|     #1     | 02.02. - 08.02. | Iepazīties ar izmantotajām tehnoloģijām, izveidojot vienkāršu komunikācijas ķēdi starp visiem iesaistītajiem dalībniekiem. |    Mārcis    |
|     #1     | 02.02. - 08.02. | Iepazīties ar izmantotajām tehnoloģijām, izveidojot vienkāršu komunikācijas ķēdi starp visiem iesaistītajiem dalībniekiem. |   Roberts    |
|     #2     | 09.02. - 15.02. | Izstrādāt vienkāršu saskarni, laika līnijas un aktuālo notikumu ailes vizuālo uzmetumu.                                    |    Mārcis    |
|     #2     | 09.02. - 15.02. | Izstrādāt vienkāršu saskarni, laika līnijas un aktuālo notikumu ailes vizuālo uzmetumu.                                    |   Roberts    |
|     #3     | 16.02. - 22.02. | Pievienot filtru un funkciju paneļa vizuālo uzmetumu.                                                                      |    Mārcis    |
|     #3     | 16.02. - 22.02. | Pievienot filtru un funkciju paneļa vizuālo uzmetumu.                                                                      |   Roberts    |
|     #4     | 23.02. - 01.03. | Izstrādāt notikumu pievienošanas un izdzēšanas funkciju, neiekļaujot apzīmētājus.                                          |    Mārcis    |
|     #4     | 23.02. - 01.03. | Izstrādāt notikumu pievienošanas un izdzēšanas funkciju, neiekļaujot apzīmētājus.                                          |   Roberts    |
|     #5     | 02.03. - 08.03. | Izstrādāt apzīmētāju pievienošanas un izdzēšanas funkciju.                                                                 |    Mārcis    |
|     #5     | 02.03. - 08.03. | Izstrādāt apzīmētāju pievienošanas un izdzēšanas funkciju.                                                                 |   Roberts    |
|     #6     | 09.03. - 15.03. | Pievienot apzīmētājus notikumu pievienošanas funkcijai.                                                                    |    Mārcis    |
|     #6     | 09.03. - 15.03. | Pievienot apzīmētājus notikumu pievienošanas funkcijai.                                                                    |   Roberts    |
|     #7     | 16.03. - 22.03. | Izstrādāt notikumu filtrēšanas funkciju pēc datuma un apzīmētāja.                                                          |    Mārcis    |
|     #7     | 16.03. - 22.03. | Izstrādāt notikumu filtrēšanas funkciju pēc datuma un apzīmētāja.                                                          |   Roberts    |
|     #8     | 23.03. - 29.03. | Izstrādāt reģistrācijas saskarni.                                                                                          |    Mārcis    |
|     #8     | 23.03. - 29.03. | Izstrādāt reģistrācijas saskarni.                                                                                          |   Roberts    |
|     #9     | 30.03. - 05.04. | Pievienot Google reģistrāciju / autentifikāciju.                                                                           |    Mārcis    |
|     #9     | 30.03. - 05.04. | Pievienot Google reģistrāciju / autentifikāciju.                                                                           |   Roberts    |
|    #10     | 06.04. - 12.04. | Pielāgot saskarni mobilajām ierīcēm.                                                                                       |    Mārcis    |
|    #10     | 06.04. - 12.04. | Pielāgot saskarni mobilajām ierīcēm.                                                                                       |   Roberts    |
|    #11     | 13.04. - 19.04. | "Noslīpēt" lietotni veicot smalkas vizuālās izmaiņas saskarnē, lai to padarītu ērtāku lietošanai.                          |    Mārcis    |
|    #11     | 13.04. - 19.04. | "Noslīpēt" lietotni veicot smalkas vizuālās izmaiņas saskarnē, lai to padarītu ērtāku lietošanai.                          |   Roberts    |
|    #12     | 20.04. - 26.04. | Iespējot lietotnes atvēršanu no mobilajām ierīcēm, kā tīkla aplikāciju.                                                    |    Mārcis    |
|    #12     | 20.04. - 26.04. | Iespējot lietotnes atvēršanu no mobilajām ierīcēm, kā tīkla aplikāciju.                                                    |   Roberts    |
|    #13     | 27.04. - 03.05. | Veikt testēšanu, izdalot lietotni lietotājiem, veicot uzlabojumus un labojot kļūdas, ja nepieciešams.                      |    Mārcis    |
|    #13     | 27.04. - 03.05. | Veikt testēšanu, izdalot lietotni lietotājiem, veicot uzlabojumus un labojot kļūdas, ja nepieciešams.                      |   Roberts    |
|    #14     | 04.05. - 08.05. | Prezentēt lietotni.                                                                                                        |    Mārcis    |
|    #14     | 04.05. - 08.05. | Prezentēt lietotni.      <br/>                                                                                                  |   Roberts    |


## Instrukcijas lietotnes izmantošanai un testēšanai

Lai palaistu aplikāciju ir nepieciešams ielādēt docker desktop.
Klonē projektu no GitHub.
Kad tas ir izdarīts, tad terminali raksti: "docker build -t planner-app ."
Tad raksti: "docker run -p 3000:3000 --name planner planner-app"
Tad: "docker start -a planner"
Ja vēlies, lai visi dati saglabājas lokāli pēc restartēšanas, tad ar Windows raksti šo:
"docker run -p 3000:3000 --name planner -v %cd%:/app planner-app"
Bet ja ar Mac vai Linux, tad šādi:
"docker run -p 3000:3000 --name planner -v $(pwd):/app planner-app"
Ja vēlies, lai serveris strada tikai fona, tad pietiek "docker start -a planner" vietā var "docker start planner" 
