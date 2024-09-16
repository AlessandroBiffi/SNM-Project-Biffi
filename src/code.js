const client_id = "5b5561aff1d2425f99e3263af7c3814e"
const client_secret = "08e3187d9ca946dc8e80e60a7f3f0af0"
var url = "https://accounts.spotify.com/api/token"
const port = 3100
var prev;
var next;
var naz
var genre

//################################################# GENERALI/GLOBALI #################################################

function genera_durata(durata){

  var minuti = String(((durata/1000)/60)).substring(0,1)
  if((String(((durata/1000)%60)).substring(0,2)).charAt(1) == '.'){
    var secondi = '0' + String(((durata/1000)%60)).charAt(0)
  }else{
    var secondi = String(((durata/1000)%60)).substring(0,2)
  }

  return minuti + ":" + secondi
}

//################################################# REGISTRAZIONE #################################################

//CARICA GENERI

function caricaGeneri() {

    fetch("https://api.spotify.com/v1/recommendations/available-genre-seeds", {
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + access_token,
            },
        })
        .then(response => response.json())
        .then((responseQ) => {
            console.log(responseQ);
            var genere = document.getElementsByClassName("genereReg")[0];
            for (i = 0; i < responseQ.genres.length; i++) {
                var clone_opt = genere.cloneNode(true)
                clone_opt.classList.remove('d-none')
                clone_opt.innerHTML = responseQ.genres[i];
                genere.before(clone_opt);
            }
        })
}
//PASSWORD CHECK CONTROLLI DESIGN

function checkFormReg() {

    var pw1 = document.getElementById('pw1')
    var pw2 = document.getElementById('pw2')
    var special = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/;  //per includere una lettera maiuscola, un numero e un char speeciale
    var error = 0

    if (pw1 == undefined || pw2 == undefined || pw1.value != pw2.value || pw1.value.length < 7 || !pw1.value.match(special)) {
        pw1.classList.add('border')
        pw1.classList.add('border-2')   //dimensione border di boostrap
        pw1.classList.add('border-danger')
        pw1.value = ""
        pw2.classList.add('border')
        pw2.classList.add('border-2')
        pw2.classList.add('border-danger')
        pw2.value = ""
        error = 1
        alert("Controlla che la password sia uguale e maggiore di 7. Deve contenere almeno un/una:\n-lettera maiuscola\n-numero\n-carattere speciale")
    } else {
        pw1.classList.remove('border')
        pw1.classList.remove('border-2')
        pw1.classList.remove('border-danger')
        pw2.classList.remove('border')
        pw2.classList.remove('border-2')
        pw2.classList.remove('border-danger')
    }

    var email = document.getElementById("emailReg")
    var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!regex.test(email.value)){
      email.classList.add('border')
      email.classList.add('border-2')
      email.classList.add('border-danger')
      error = 1
      alert("Email non valida, inserisci un indirizzo corretto")
    } else {
      email.classList.remove('border')
      email.classList.remove('border-2')
      email.classList.remove('border-danger')
    }

    var nome = document.getElementById("nomeReg")
    if(nome.value == ''){
      nome.classList.add('border')
      nome.classList.add('border-2')
      nome.classList.add('border-danger')
      error = 1
      alert("Inserisci un nickname")
    } else {
      nome.classList.remove('border')
      nome.classList.remove('border-2')
      nome.classList.remove('border-danger')
    }


    return error

}

//REGISTRAZIONE NEL DATABASE

function registrati() {
 
    if(checkFormReg() == 1)
      return

    var email = document.getElementById('emailReg')
    var nome = document.getElementById('nomeReg')
    console.log(nome)

    var generi_selezionati = document.querySelectorAll("option:checked");
    var generi_selezionati_values = []
      for (i = 0; i < generi_selezionati.length; i++) {
  
          generi_selezionati_values.push(generi_selezionati[i].value)
  
      }
    console.log(generi_selezionati_values)
    
    var artisti_selezionati = document.querySelectorAll(".item-list-group"); //css preciso
    var artisti_selezionati_values = []
    for (i = 0; i < artisti_selezionati.length; i++) {

        artisti_selezionati_values.push(artisti_selezionati[i].innerHTML)

    }

    var data = {
        name_user: nome.value,
        email: email.value,
        password: pw1.value,
        genres: generi_selezionati_values,
        artists_favorites: artisti_selezionati_values
    }

    console.log(data)

    fetch("http://127.0.0.1:"+port+"/users/registrazione", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data) //converte un valore JavaScript in una stringa JSON
    }).then(response => {
        if (response.ok) {
            window.location.href = "login.html"
        } else {
            response.text().then(text =>
                alert(text)
            )
            var email = document.getElementById("emailReg")
            email.classList.add('border')
            email.classList.add('border-2')
            email.classList.add('border-danger')

            var nome = document.getElementById("nomeReg")
            nome.classList.add('border')
            nome.classList.add('border-2')
            nome.classList.add('border-danger')
        }

    })
}

//PREV ARTISTA

function prevArtist() {

    console.log(prev);

    if (prev != null) {
        fetch(prev, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + access_token,
                },
            })
            .then((response) => response.json())
            .then((searchResults) => {
                console.log(searchResults);
                if(location.href.substring(location.href.lastIndexOf('/') + 1) == "registrazione.html") {
                  viewArtistReg(searchResults);
                }
                else if (location.href.substring(location.href.lastIndexOf('/') + 1) == "artistipreferiti.html"){
                  viewArtistSearch(searchResults);
                }
            })
    }

}

//NEXT ARTISTA

function nextArtist() {

    if (next != null) {
        fetch(next, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + access_token,
                },
            })
            .then((response) => response.json())
            .then((searchResults) => {
                console.log(searchResults);
                if(location.href.substring(location.href.lastIndexOf('/') + 1) == "registrazione.html") {
                  viewArtistReg(searchResults);
                }
                else if (location.href.substring(location.href.lastIndexOf('/') + 1) == "artistipreferiti.html"){
                  viewArtistSearch(searchResults);
                }
            })
    }
}

//CERCA ARTISTI

//usato anche nella sezione modifica artiati preferiti
function searchArtist(nameArtist) {

    //console.log(nameArtist.length);
    if (nameArtist.length > 0) {

        fetch("https://api.spotify.com/v1/search?q=" + nameArtist + "&type=artist&limit=" + 4, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + access_token,
                },
            })
            .then((response) => response.json())
            .then((searchResults) => {
                //console.log(searchResults);
                if(location.href.substring(location.href.lastIndexOf('/') + 1) == "registrazione.html") {
                  viewArtistReg(searchResults);
                }
                else if (location.href.substring(location.href.lastIndexOf('/') + 1) == "artistipreferiti.html"){
                  viewArtistSearch(searchResults);
                }
            })

    } else {

      if(location.href.substring(location.href.lastIndexOf('/') + 1) == "registrazione.html") {
        var box = document.getElementById("box-artist")
        var container = document.getElementById("container-artist")
        container.innerHTML = ""
        container.append(box)
        document.getElementById("nameArtistTyped").value = ''
        //per pagina registrazone in caso search bar vuota
      }
      else if (location.href.substring(location.href.lastIndexOf('/') + 1) == "artistipreferiti.html"){
        var contenuto = document.getElementsByClassName("singolo-artista-search")[0]
        var container = document.getElementById("box-artist-search")
        container.innerHTML = ""
        container.append(contenuto)
      //per pagina gestisci preferiti in caso search bar vuota
      }

    }

}

//GENERA BOX ARTISTI

function viewArtistReg(artist) {

    console.log(artist)
    console.log("next: " + artist);
    console.log("prev: " + prev);

    //forniti da spotify
    prev = artist.artists.previous;
    next = artist.artists.next;

    var pagination = document.getElementById("pagination-artists")
    pagination.classList.remove('d-none')

    var box = document.getElementById("box-artist")
    var container = document.getElementById("container-artist")
    container.innerHTML = ""
    container.append(box)
    console.log(artist.artists.items.length)

    for (var i = artist.artists.items.length - 1; i >= 0; i--) {
        var clone = box.cloneNode(true)

        clone.id = 'box-artist-' + i;
        clone.getElementsByClassName('artist-name')[0].innerHTML = artist.artists.items[i].name
        clone.getElementsByClassName('img-artist')[0].name = artist.artists.items[i].name
        if (artist.artists.items[i].images.length != 0)
            clone.getElementsByClassName('img-artist')[0].src = artist.artists.items[i].images[0].url
        else
            clone.getElementsByClassName('img-artist')[0].src = "https://placehold.co/400"

        clone.classList.remove('d-none')

        box.after(clone)

    }

}

//AGGIUNTA PREFERITI SU HTML

function aggiungiPreferiti(name) {
  var ul = document.getElementById("lista-preferiti");
  var ulcheck = document.querySelectorAll('#lista-preferiti li'); // Prendi solo i li sotto 'lista-preferiti'

  var check = false; //booleano per la verifica
  console.log(ul);

  // itera attraverso ogni elemento li e controlla il contenuto testuale
  for (var i = 0; i < ulcheck.length; i++) {
      if (name === ulcheck[i].textContent) { // Confronta con il testo del nodo li
          check = true;
          break; // esce dal loop se il nome è già nella lista
      }
  }

  if (!check) {
      var li = document.createElement("LI");
      li.classList.add("item-list-group");
      li.style.color = "white";
      li.appendChild(document.createTextNode(name));
      ul.appendChild(li);
      next = null; // Stop Frecce Artisti, se no vanno anche quando ne selezioni uno e la barra di ricerca è vuota
      prev = null;
  } else {
      alert("Artista già selezionato");
  }
}

//################################################# LOGIN #################################################

//CREAZIONE TOKEN

function creaToken() {

  fetch(url, {
          method: "POST",
          headers: {
              Authorization: "Basic " + btoa(`${client_id}:${client_secret}`),
              "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
              grant_type: "client_credentials"
          }),
      })
      .then((response) => response.json())
      .then((tokenResponse) => {
          console.log(tokenResponse);
          localStorage.removeItem("access_token")
          localStorage.setItem("access_token", tokenResponse.access_token);

      })

}
const access_token = localStorage.getItem("access_token");

//LOGIN

function accedi() {
    var user = document.getElementById('user_login')
    var password = document.getElementById('password_login')

    user = {
        name_user: user.value,
        password: password.value
    }

    //console.log(user)

    fetch("http://127.0.0.1:"+port+"/users/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        }).then(response => {

            if (!response.ok){
                var idLog = document.getElementById("user_login")
                idLog.classList.add('border')
                idLog.classList.add('border-2')
                idLog.classList.add('border-danger')
                var pwLog = document.getElementById("password_login")
                pwLog.classList.add('border')
                pwLog.classList.add('border-2')
                pwLog.classList.add('border-danger')
                alert("combinazione email e password non corretta")
                throw new Error(`HTTP error: ${response.status}`);
            }
            else{
                return response.json()  //per avere dati name_user e id del utente
            }

        })
        .then(data => {
            console.log(data.loggedUser.name_user)
            sessionStorage.setItem("name_user", (data.loggedUser.name_user))
            sessionStorage.setItem("_iduser", (data.loggedUser._id))
            window.location.href = "home.html"
        })
}

//################################################# HOME #################################################

//SELEZIONA GEN/NAZ + AZIONE HOME O PREFERENZE MUSICALI

function selected_naz(new_naz) {
    naz = new_naz
    document.getElementById("button-nations").innerHTML = naz
    
    searchContent()

}

function selected_genre(new_genre) {
    genre = new_genre
    document.getElementById("button-genres").innerHTML = genre
    
    searchContent()
}

//CERCA CONTENUTO PAGINA

function searchContent() {

  //console.log(naz, genre)
  var track = document.getElementById("search-home-track").value
  var artist = document.getElementById("search-home-artist").value
  var album = document.getElementById("search-home-album").value
  var trackSearch = "track:" + track
  var albumSearch = " album:" + album
  var artistSearch = " artist:" + artist

  if (track.length > 0 || artist.length > 0 || album.length > 0) {

    var contenuto = document.getElementsByClassName("col home")[0]
    var container = document.getElementById("container-card home")
    container.innerHTML = ""
    container.append(contenuto)

    //per permetere di vedere ad esempio tracks senza inserire per forza anche artist e album
    if (track == "")
      trackSearch = ""
    if (album == "")
      albumSearch = ""
    if (artist == "")
      artistSearch = ""

    if (genre == undefined)
      genreSearch = ""
    else
      genreSearch = " genre:" + genre

    if (naz == undefined)
      naz = "IT"

    //console.log("https://api.spotify.com/v1/search?q=" + trackSearch + albumSearch + artistSearch + "&type=track&market=" + naz + "&limit=12")
    fetch("https://api.spotify.com/v1/search?q=" + trackSearch + albumSearch + artistSearch + genreSearch + "&type=track&market=" + naz + "&limit=12", {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + access_token,
        },
      })
      .then((response) => response.json())
      .then((searchResults) => {
        console.log(searchResults);
        document.getElementById("loadingBox").classList.add("d-none")
        viewContentTrack(searchResults)
      })
  } else {

    if (naz == undefined)
      naz = "IT"

    fetch("https://api.spotify.com/v1/playlists/37i9dQZEVXbMDoHDwVN2tF/tracks?offset=0&limit=12", {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + access_token,
      },
    })
    .then((response) => response.json())
    .then((searchResults) => {
      console.log(searchResults);
      document.getElementById("loadingBox").classList.add("d-none")
      viewContentTrackTop(searchResults)
    })

  }

}

//GENERA BOX TRACCE

function viewContentTrack(data) {

    //console.log(data)

    var contenuto = document.getElementsByClassName("col home")[0]
    var container = document.getElementById("container-card home")
    container.innerHTML = ""
    container.append(contenuto)

    for (var i = data.tracks.items.length - 1; i >= 0; i--) {
        var clone = contenuto.cloneNode(true)

        clone.getElementsByClassName('card home h-100 text-center')[0].id = data.tracks.items[i].id;
        clone.getElementsByClassName('card-text home')[0].innerHTML = data.tracks.items[i].artists[0].name
        clone.getElementsByClassName('card-title home')[0].innerHTML = data.tracks.items[i].name
        if (data.tracks.items[i].album.images.length != 0)
            clone.getElementsByClassName('card-img-top home')[0].src = data.tracks.items[i].album.images[0].url
        else
            clone.getElementsByClassName('card-img-top home')[0].src = "https://placehold.co/400"

        clone.classList.remove('d-none')

        contenuto.after(clone)

    }

}

//GENERA BOX TRACCE TOP

function viewContentTrackTop(data) {

  console.log(data)

  var contenuto = document.getElementsByClassName("col home")[0]
  var container = document.getElementById("container-card home")
  container.innerHTML = ""
  container.append(contenuto)

  for (var i = data.items.length - 1; i >= 0; i--) {
      var clone = contenuto.cloneNode(true)

        clone.getElementsByClassName('card home h-100 text-center')[0].id = data.items[i].track.id;
        clone.getElementsByClassName('card-text home')[0].innerHTML = data.items[i].track.artists[0].name
        clone.getElementsByClassName('card-title home')[0].innerHTML = data.items[i].track.name
        if (data.items[i].track.album.images.length != 0)
           clone.getElementsByClassName('card-img-top home')[0].src = data.items[i].track.album.images[0].url
        else
           clone.getElementsByClassName('card-img-top home')[0].src = "https://placehold.co/400"

      clone.classList.remove('d-none')

      contenuto.after(clone)

  }

}

//GENERA MARKET (NAZIONI)

function createNations() {

    fetch("https://api.spotify.com/v1/markets", {
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + access_token,
            },
        })
        .then(response => response.json())
        .then((nationsResponse) => {
            //console.log(nationsResponse);
            var contenuto = document.getElementsByClassName("dropdown-item nation")[0]
            for (i = 0; i < nationsResponse.markets.length; i++) {
                var clone = contenuto.cloneNode(true)
                clone.classList.remove('d-none')
                clone.innerHTML = nationsResponse.markets[i];
                contenuto.before(clone)
            }
        })

}

//GENERA GENRES (GENERI) (ANCHE PER PREFERENZE MUSICALI)

function createGenres() {

    fetch("https://api.spotify.com/v1/recommendations/available-genre-seeds", {
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + access_token,
            },
        })
        .then(response => response.json())
        .then((genresResponse) => {
            //console.log(genresResponse);
            var contenuto = document.getElementsByClassName("dropdown-item genres")[0]
            for (i = 0; i < genresResponse.genres.length; i++) {
                var clone = contenuto.cloneNode(true)
                clone.classList.remove('d-none')
                clone.innerHTML = genresResponse.genres[i];
                contenuto.before(clone)
            }
        })

}

//CAMBIA COLORE CARD SONG

function change_color_card(id) {

  var card = document.getElementById(id);
  card.style.backgroundColor = 'rgb(23, 23, 23)';

}

//REIMPOSTA COLORE CARD SONG

function return_color_card(id) {

  var card = document.getElementById(id);
  card.style.backgroundColor = 'rgb(0, 0, 0)';

}

//################################################# DATI PERSONALI #################################################

//ELIMINA UTENTE

function deleteAccount() {

    username = sessionStorage.getItem("name_user")


    fetch("http://127.0.0.1:"+port+"/users/delete/" + username, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => res.json()) // or res.text()
        .then(res => {
            console.log(res)
            if (res.deletedCount == 1) {
                alert("utente eliminato con successo")
                sessionStorage.removeItem("name_user")
                window.location.href = "../starter/registrazione.html"
            } else {
                alert("eliminazione fallita")
            }
        })

}

//CAMBIA DATI

function changeDati(){

  var new_password = document.getElementById("change-password").value
  var password_old = document.getElementById("change-password-old").value
  var new_username = document.getElementById("change-username").value

  var new_data = {
      "name_user": new_username,
      "name_user_old": sessionStorage.getItem("name_user"),
      "password": new_password,
      "password_old": password_old,
      "id_user" : sessionStorage.getItem("_iduser")
  }

  fetch("http://127.0.0.1:"+port+"/users/change", {
            method: 'PUT',
            headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify(new_data) 
        }).then(res => res.json()) // or res.text()
        .then(res => {
            console.log(res)
            if(res.name_user){
              sessionStorage.setItem("name_user", res.name_user)
              document.getElementById("nameuser").innerHTML = sessionStorage.getItem("name_user")
              document.getElementById("change-username").value = ''
              alert("username modificato con successo")
          }else if(res.password){
              document.getElementById("change-password").value = ''
              document.getElementById("change-password-old").value = ''
              alert("password modificata con successo")
            }else{
              alert(res)
            }
            
        })

        //Controlla che la password sia uguale e maggiore di 7. Deve contenere almeno un/una:\n-lettera maiuscola\n-numero\n-carattere speciale
        //Username non valido o gia in utilizzo


}

//OTTIENI NOME UTENTE (vale anche per ACCOUNT)

function get_user_name() {
    var name_user = sessionStorage.getItem("name_user")
    document.getElementById("nameuser").innerHTML = name_user
}

//OTTIENI PRIME 2 LETTERE NOME UTENTE 

function getFirst_user_name() {
    var name_user = sessionStorage.getItem("name_user").slice(0, 2).toUpperCase()
    document.getElementById("firstnameuser").innerHTML = name_user
}


function changeOneAtTime(){

  var text_pw = document.getElementById("change-password")
  var text_pw_old = document.getElementById("change-password-old")
  var text_user = document.getElementById("change-username")

  if(text_pw.value != "" || text_pw_old.value != ""){
    text_user.setAttribute("readonly", "")
    text_user.value = null
  }else{
    text_user.removeAttribute("readonly", "")
  }

  if(text_user.value != ""){
    text_pw.setAttribute("readonly", "")
    text_pw.value = null
    text_pw_old.setAttribute("readonly", "")
    text_pw_old.value = null
  }else{
    text_pw.removeAttribute("readonly", "")
    text_pw_old.removeAttribute("readonly", "")
  }

}

//################################################# PERSONAL PLAYLIST #################################################

//RESTITUISCE URL DI HUB PLAYLIST OPPURE DI TRACK NEL CASO L"UTENTE ABBIA PROVATO AD AGGIUNGERE UNA TRACK AD UNA PLAYLIST, MA NON AVENDOLE E" STATO REINDIRIZZATO ALLA PAGINA DI CREAZIONE PLAYLIST

function setPreviusURL(urlp){ //settato in track e hubplaylist

  sessionStorage.setItem("previusURL", urlp)
  if(urlp)
    return 1
  else
    return 0
  
}

function getPreviusURL(){ //settato in personalplaylist
  var previusURL = sessionStorage.getItem("previusURL")
  return location.href = previusURL
}

//CREA PLAYLIST

function newPlaylistPersonale(){
  var nome = document.getElementById("nome-playlist").value
  var tags = document.getElementById("tag-playlist").value
  tags = tags.split(', ') //split per fare array con tag separati
  var tipo = document.getElementById("button-tipo").innerHTML
  var descrizione = document.getElementById("descrizione-playlist").value

  var idUser = sessionStorage.getItem("_iduser")
  var nameUser = sessionStorage.getItem("name_user")

  var data = {
    "nome": nome,
    "descrizione": descrizione,
    "tipo": tipo,
    "_iduser" : idUser,
    "tags": tags,
    "songs" : []
}

  fetch("http://127.0.0.1:"+port+"/users/playlistPersonali/add", {
            method: 'POST',
            headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify(data) 
        }).then(res => res.json()) // o res.text()
        .then(res => {

          console.log(res)
          if(res.acknowledged == true){
            alert("playlist creata con successo")
            window.location.reload()
          }else{
            alert(res)
          }

        })

}

function selectedTipo(tipo){
  document.getElementById("button-tipo").innerHTML = tipo
}

//VISTA PLAYLISTs PERSONALI

function viewPlaylistsPersonali(){

  var myID = sessionStorage.getItem("_iduser")

  fetch("http://127.0.0.1:"+port+"/users/playlistPersonali/view?id=" + myID, {
            method: 'GET',
            headers: {
              "Content-Type": "application/json"
          }
        }).then(res => res.json()) // or res.text()
        .then(res => {
          
          console.log(res)

          for(var i=0; i < res.length ; i++){

            if(res[i].tipo == 'pubblica' || res[i].tipo == 'privata'){
              var playlist = document.getElementsByClassName("singola-playlist")[0]
              var clone = playlist.cloneNode(true)
              clone.classList.remove('d-none')
              clone.getElementsByClassName("titolo-playlist")[0].innerHTML = res[i].nome
              clone.getElementsByClassName("tipo-playlist")[0].innerHTML = res[i].tipo
              clone.getElementsByClassName("data-playlist")[0].innerHTML = res[i].data_creazione
              clone.getElementsByClassName("vedi-playlist")[0].id = res[i]._id
              clone.getElementsByClassName("del-playlist")[0].id = res[i]._id
              playlist.before(clone)
            }
            else if(res[i].tipo == 'importata'){
              var playlist = document.getElementsByClassName("singola-playlist-imported")[0]
              var clone = playlist.cloneNode(true)
              clone.classList.remove('d-none')
              clone.getElementsByClassName("titolo-playlist")[0].innerHTML = res[i].nome
              clone.getElementsByClassName("tipo-playlist")[0].innerHTML = res[i].tipo
              clone.getElementsByClassName("data-playlist")[0].innerHTML = res[i].data_creazione
              clone.getElementsByClassName("vedi-playlist")[0].id = res[i]._id
              clone.getElementsByClassName("del-playlist")[0].id = res[i]._id
              playlist.before(clone)
            }

          }

          document.getElementsByClassName("loadingBox")[0].classList.add("d-none")
          document.getElementsByClassName("loadingBox")[1].classList.add("d-none")

        })

}

//ELIMINA PLAYLIST PERSONALE

function deletePlaylistPersonale(idPlaylist){


  fetch("http://127.0.0.1:"+port+"/users/playlistPersonali/delete?idplaylist=" + idPlaylist, {
            method: 'DELETE',
            headers: {
              "Content-Type": "application/json"
          }
        }).then(res => res.json()) // or res.text()
        .then(res => {

          console.log(res)
          if(res.acknowledged == true){
            alert("eliminazione avvenuta con successo")
            window.location.reload()
          }else{
            alert("errore eliminazione")
          }
          

        })

}

//CAMBIA SLEZIONE BOTTONE PER COMODITA INNERHTML

function selectedTipo(tipo){
  document.getElementById("button-tipo").innerHTML = tipo
}

//SETTAGGIO CORRETTO PER HASHTAG

function setHashtag(){

    var inputElement = document.getElementById("tag-playlist");
    if(!inputElement)
      inputElement = document.getElementById("search-esplora-tags");  //per pagina di esplora playlist

    const inputText = inputElement.value;
    
    // Suddivide il testo in base alle virgole e rimuove gli spazi in eccesso
    const parole = inputText.split(',').map(parola => parola.trim());

    // Aggiunge '#' solo all'inizio di ogni parola non vuota e senza '#'
    const risultato = parole.map(parola => {
        // Controlla se la parola è non vuota e non inizia già con '#'
        if (parola && !parola.startsWith('#')) {
            return `#${parola}`;
        } else if (parola === '#') {
            // Se la parola è solo '#', ritorna una stringa vuota
            return '';
        }
        return parola; // Restituisce la parola originale se è vuota o inizia già con '#'
    });

    // Unisce il risultato in una stringa e aggiorna il valore dell'input
    inputElement.value = risultato.join(', ');

    checkVuoto(); //per sezione esplora (quando non c'e scritto nulla)
}

//################################################# TRACK #################################################

//GENERA TRACCIA

function trackView() {

  var urlParams = new URLSearchParams(window.location.search); //prendo id song passato tramite url... tricksss
  var idTrack = urlParams.get('idTrack');

  fetch("https://api.spotify.com/v1/tracks/" + idTrack, {
          headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + access_token,
          },
      })
      .then((response) => response.json())
      .then((trackInfo) => {
          
          console.log(trackInfo);
          document.getElementById("img-track").src = trackInfo.album.images[1].url
          document.getElementById("titolo-track").innerHTML = trackInfo.name
          document.getElementById("artista-track").innerHTML = trackInfo.artists[0].name
          document.getElementById("uscita-track").innerHTML = "uscita: " + trackInfo.album.release_date
          var durata = genera_durata(trackInfo.duration_ms)
          
          document.getElementById("durata-track").innerHTML = "durata: " + durata


      })

}

//SELEZIONE PLAYLIST PER AGGIUNTA TRACK

function selectTrackPlaylist() {

  var myID = sessionStorage.getItem("_iduser")

  fetch("http://127.0.0.1:"+port+"/users/playlistPersonali/view?id=" + myID, {
            method: 'GET',
            headers: {
              "Content-Type": "application/json"
          }
        }).then(res => res.json()) // or res.text()
        .then(res => {

          console.log(res)
          var playlist = document.getElementsByClassName("dropdown-item d-none")[0]
          
         


          for(var i=0; i < res.length ; i++){
            if(res[i].tipo != "importata"){  //non far aggiungere song alle playlist importate
              var clone = playlist.cloneNode(true)
              clone.classList.remove('d-none')
              clone.innerHTML = res[i].nome
              clone.id = res[i]._id

              clone.onclick = function() {
                document.getElementsByClassName("button-playlist")[0].innerHTML = this.innerHTML;
                document.getElementsByClassName("button-playlist-selected")[0].id = this.id; //poi prendo id da bottone 
              }  //onclick lato js figo
              
              playlist.before(clone)
            }
          }

          var checkOnlyImported = 0
          for(var i=0; i<res.length; i++){
            checkOnlyImported = 0
            if(res[i].tipo = 'importata')
              checkOnlyImported = 1   //cosi capisco se sono tutte importate e deve apparire ancora "crea playlist"
          }

          if(res.length == 0  || checkOnlyImported){  //in caso non esiste una playlist a cui aggiungere la canzone ti rimandera alla pagina di creazione playlist
              
            var bottone = document.getElementsByClassName("button-playlist btn btn-secondary dropdown-toggle")[0]
            bottone.classList.remove('dropdown-toggle')
            bottone.classList.add('rounded')
            bottone.removeAttribute('data-bs-toggle')
            bottone.innerHTML = 'crea playlist'
            bottone.style.backgroundColor = 'rgb(210, 200, 0)'
            bottone.style.color ='black'
              
            bottone.onclick = function() {
              console.log(window.location.href)
              if( setPreviusURL(window.location.href) == 1)
                location.href =  "../playlist/personalplaylist.html"
            }  //onclick lato js figo
          }

        })

}

//AGGIUNTA TRACK A PLAYLIST

function addTrackPlaylist(idplaylist) {

  var urlParams = new URLSearchParams(window.location.search); //prendo id song passato tramite url... tricksss
  var idTrack = urlParams.get('idTrack');

  var data = {
    "_idplaylist" : idplaylist,
    "_idsong" : idTrack
  }

  fetch("http://127.0.0.1:"+port+"/users/playlistPersonali/addTrack", {
            method: 'PUT',
            headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify(data) 
        }).then(res => res.json()) // or res.text()
        .then(res => {
          
          console.log(res)
          if(res.modifiedCount == 1){
            alert("traccia aggiunta")
          }else{
            alert(res)
          }

        })

}

//################################################# MIA PLAYLIST #################################################

//VISTA PLAYLIST PERSONALE

function viewPlaylistPersonale(idplaylist){

  var urlParams = new URLSearchParams(window.location.search); //prendo id song passato tramite url... tricksss
  var idplaylist= urlParams.get('idplaylist');

  fetch("http://127.0.0.1:"+port+"/users/playlistPersonali/viewOne?idplaylist=" + idplaylist, {
            method: 'GET',
            headers: {
              "Content-Type": "application/json"
          }
        }).then(res => res.json()) // or res.text()
        .then(res => {

          console.log(res)
          document.getElementById("titolo-playlist").innerHTML = res.nome
          document.getElementById("descrizione-playlist").innerHTML = res.descrizione
          for(var i=0,allTags=''; i<res.tags.length; i++){
            allTags = allTags + " " + res.tags[i]
          }
          document.getElementById("tags-playlist").innerHTML = allTags

          seeTracksPlaylist(res.songs, res.tipo)  //tipo uso per non permettere di eliminare song da canzoni importate
        
          if(!res.importFrom){
            sessionStorage.setItem("idBy")  //per far si che nelle playlist personali non appaia il "importato da..."
          }
          else{
            sessionStorage.setItem("idBy", res.importFrom)
          }

        }).then(res => {

          
          var idBy = sessionStorage.getItem("idBy")
          console.log(idBy)

          if(idBy != "(account eliminato)"){
          
          fetch("http://127.0.0.1:"+port+"/user/" + idBy, {
            method: 'GET',
            headers: {
              "Content-Type": "application/json"
             }
           }).then(res => res.json()) // or res.text()
          .then(res => {
      
             console.log(res)
             document.getElementById("byIf").innerHTML = "Importata da " + res.name_user
      
           })
          }else{
            document.getElementById("byIf").innerHTML = "Importata da " + idBy
          }


        })

}

//MOSTRA CANZONI INTERNO A PLAYLIST SINGOLA PERSONALE

function seeTracksPlaylist(songs, tipo){

  for(var i=0; i<songs.length; i++){

    fetch("https://api.spotify.com/v1/tracks/" + songs[i], {
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + access_token,
            },
          }).then(res => res.json()) // or res.text()
          .then(res => {
              var song = document.getElementsByClassName("song")[0]
              var clone = song.cloneNode(true)
              clone.classList.remove('d-none')
              clone.getElementsByClassName("titolo-song")[0].innerHTML = res.name
              clone.getElementsByClassName("artista-song")[0].innerHTML = res.artists[0].name
              clone.getElementsByClassName("img-song")[0].src = res.album.images[2].url
              clone.getElementsByClassName("uscita-song")[0].innerHTML = res.album.release_date
              clone.getElementsByClassName("durata-song")[0].innerHTML = genera_durata(res.duration_ms)
              if(tipo !== "importata"){
                clone.getElementsByClassName("btn-song")[0].id = res.id
                clone.getElementsByClassName("btn-song")[0].classList.remove("d-none")
              }
              song.before(clone)


          })

  }

}

//ELIMINA UNA SONG DA PLAYLIST PERSONALE

function deleteSongPlaylistPersonale(idsong){

  var urlParams = new URLSearchParams(window.location.search); //prendo id song passato tramite url... tricksss
  var idplaylist= urlParams.get('idplaylist');

  fetch("http://127.0.0.1:"+port+"/users/playlistPersonali/deleteOne?idsong=" + idsong + "&idplaylist=" + idplaylist, {
            method: 'PUT',
            headers: {
              "Content-Type": "application/json"
          }
        }).then(res => res.json()) // or res.text()
        .then(res => {

          console.log(res)
          if(res.acknowledged == true){
            alert("eliminazione avvenuta con successo")
            window.location.reload()  //ricaricando la funz in onload rigenera le song dentro la playlist
          }else{
            alert("errore eliminazione")
          }location.reload()  //ricaricando la funz in onload rigenera le song dentro la playlist

        })

}

//################################################# ARTISTI PREFERITI #################################################

//MOSTRA ARTISTI PREFERITI SALVATI

function viewArtistSalvati(){

  var iduser = sessionStorage.getItem("_iduser")
  
  fetch("http://127.0.0.1:"+port+"/users/ArtistsFav?iduser=" + iduser, {
            method: 'GET',
            headers: {
              "Content-Type": "application/json"
          }
        }).then(res => res.json()) // or res.text()
        .then(res => {
          
          console.log(res)
          var artist = document.getElementsByClassName("singolo-artista-salvato")[0]
          for(var i=0; i<res.artists_favorites.length; i++){
          var clone = artist.cloneNode(true)
            clone.classList.remove('d-none')
            clone.getElementsByClassName("nome-artista-salvato")[0].innerHTML = res.artists_favorites[i]
            clone.getElementsByClassName("btn artista-salvato")[0].value = res.artists_favorites[i]
            artist.before(clone)
          }
          document.getElementById("loadingBox").classList.add("d-none")

        })
  
}

//AGGIUNTA E EILIMINAZIONE DI ARTIST FAVORITI

function modificaArtistsFav(artistsnew, operazione) {

  var iduser = sessionStorage.getItem("_iduser")

  //console.log(artistsnew)

  var data = {
    "_id" : iduser,
    "nameArtists" : artistsnew,
    "operazione" : operazione
  }

  fetch("http://127.0.0.1:"+port+"/users/changeArtistsFav", {
            method: 'PUT',
            headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify(data) 
        }).then(res => res.json()) // or res.text()
        .then(res => {
          
          console.log(res.modifiedCount)
          if(res.modifiedCount == 1){
            alert("modifica avvenuta con successo")
            window.location.reload()
          }else{
            alert("artista gia presente nella lista")
          }
          

        })

}

//MOSTRA ARTISTI PREFERITI DALLA BARRA DI RICERCA

function viewArtistSearch(data){
  console.log(data)

    prev = data.artists.previous;
    next = data.artists.next;
    var contenuto = document.getElementsByClassName("singolo-artista-search")[0]
    var container = document.getElementById("box-artist-search")
    container.innerHTML = ""
    container.append(contenuto)

      var artist = document.getElementsByClassName("singolo-artista-search")[0]
          for(var i=0; i<data.artists.items.length; i++){
            var clone = artist.cloneNode(true)
            clone.classList.remove('d-none')
            clone.getElementsByClassName("card-title artist")[0].innerHTML = data.artists.items[i].name
            clone.getElementsByClassName("card-img-top artist")[0].src = data.artists.items[i].images[0].url
            clone.getElementsByClassName("card artist")[0].id = "img-artist-" + i
            clone.getElementsByClassName("card artist")[0].value = data.artists.items[i].name  //per aggiungere nel caso
            artist.after(clone)
          }
}

//################################################# PREFERENZE MUSICALI #################################################

//MOSTRA GENERI PREFERITI SALVATI

function viewGenresSalvati(){

  var iduser = sessionStorage.getItem("_iduser")
  
  fetch("http://127.0.0.1:"+port+"/users/genresFav?iduser=" + iduser, {
            method: 'GET',
            headers: {
              "Content-Type": "application/json"
          }
        }).then(res => res.json()) // or res.text()
        .then(res => {
          
          console.log(res)
          var artist = document.getElementsByClassName("singolo-genere-salvato")[0]
          for(var i=0; i<res.genres.length; i++){
          var clone = artist.cloneNode(true)
            clone.classList.remove('d-none')
            clone.getElementsByClassName("nome-genere-salvato")[0].innerHTML = res.genres[i]
            clone.getElementsByClassName("btn genere-salvato")[0].value = res.genres[i]
            artist.before(clone)
          }
          document.getElementById("loadingBox").classList.add("d-none")

        })
  
}

//AGGIUNTA E EILIMINAZIONE DI GENERI FAVORITI

function modificaGenresFav(genresnew, operazione) {

  var iduser = sessionStorage.getItem("_iduser")

  //console.log(genresnew)

  var data = {
    "_id" : iduser,
    "nameGenres" : genresnew,
    "operazione" : operazione
  }

  fetch("http://127.0.0.1:"+port+"/users/changeGenresFav", {
            method: 'PUT',
            headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify(data) 
        }).then(res => res.json()) // or res.text()
        .then(res => {
          
          //console.log(res)
          if(res.modifiedCount == 1){
            alert("modifica avvenuta con successo")
            window.location.reload()
          }else{
            alert("genere gia presente nella lista")
          }
          

        })

}

function selected_new_genre(new_genre) {
  document.getElementById("button-genres").innerHTML = new_genre
  document.getElementById("gen-button").value = new_genre
}

//################################################# ESPLORA PLAYLIST #################################################


//LIMITA LA VISTA ALLE PLAYLIST PUBBLICHE CHE COINCIDONO CON IL NOME PLAYLIST DELLA RICERCA

function ricercaPlaylistPub() {

  var searchNome = document.getElementById("search-esplora").value
  var searchBy = document.getElementById("search-esplora-by").value
  var searchTags = document.getElementById("search-esplora-tags").value
  document.getElementById("search-esplora-by").value = ""
  document.getElementById("search-esplora-tags").value = ""
  searchTags = searchTags.split(', ')

  document.getElementById("noResultBox").classList.add("d-none")

  if (searchNome.length > 0 || searchBy.length > 0 || searchTags[0].length > 0) {

    var idcurrentuser = sessionStorage.getItem("_iduser")
    
    var urlCompleto = "http://127.0.0.1:" + port + "/esplora?iduser=" + idcurrentuser + "&nome=" + searchNome + "&by=" + searchBy+ "&tags="

    for(var i=0; i<searchTags.length; i++){
      urlCompleto = urlCompleto + searchTags[i].substring(1)
      if(i != searchTags.length-1){
        urlCompleto = urlCompleto + ","
      }
    }
    console.log(urlCompleto)

    fetch(urlCompleto, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json"
        }
      }).then(res => res.json()) // or res.text()
      .then(res => {

        console.log(res)
        var playlistSvuota = document.getElementsByClassName("singola-playlist-pubblica")
          for(var i=0; i<playlistSvuota.length; i++){ 
            playlistSvuota[i].classList.add("d-none")
          }

        if(res.users.length != 0){  //uguale farlo su playlists
          for (var i = 0; i < res.playlists.length; i++) {
              var playlist = document.getElementsByClassName("singola-playlist-pubblica")[0]
              var clone = playlist.cloneNode(true)
              clone.classList.remove('d-none')
              clone.getElementsByClassName("titolo-playlist")[0].innerHTML = res.playlists[i].nome
              clone.getElementsByClassName("data-playlist")[0].innerHTML = res.playlists[i].data_creazione
              clone.getElementsByClassName("vedi-playlist")[0].id = res.playlists[i]._id //per ricavare info della playlist nella pagina che reindirizza "vedi"
              
              for(var j=0; j<res.users.length; j++ ){
                if(res.playlists[i]._iduser == res.users[j]._id)
                clone.getElementsByClassName("by-playlist")[0].innerHTML = "by "+ res.users[j].name_user
              }
              
              document.getElementById("loadingBox").classList.add("d-none")
              playlist.before(clone)
          }

          document.getElementById("text-avvertimento").classList.add("d-none")

        }else{
          document.getElementById("noResultBox").classList.remove("d-none")
          document.getElementById("text-avvertimento").classList.add("d-none")
        }

      })

  } else if(searchNome.length <= 0 && searchBy.length <= 0 && searchTags[0].length <= 0){

    //metto ultime 5 playlist create dagli utenti
    seeLastTenPlay()

  }
}

function seeLastTenPlay(){

  var idcurrentuser = sessionStorage.getItem("_iduser")
  document.getElementById("noResultBox").classList.add("d-none")

    fetch("http://127.0.0.1:" + port + "/esplora/lastTen?iduser=" + idcurrentuser, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json"
      }
    }).then(res => res.json()) // or res.text()
    .then(res => {

      var playlistSvuota = document.getElementsByClassName("singola-playlist-pubblica")
      for(var i=0; i<playlistSvuota.length; i++){ 
        playlistSvuota[i].classList.add("d-none")
      }

      console.log(res)

      for (var i = 0; i < res.playlists.length; i++) {
          var playlist = document.getElementsByClassName("singola-playlist-pubblica")[0]
          var clone = playlist.cloneNode(true)
          clone.classList.remove('d-none')
          clone.getElementsByClassName("titolo-playlist")[0].innerHTML = res.playlists[i].nome
          clone.getElementsByClassName("data-playlist")[0].innerHTML = res.playlists[i].data_creazione
          clone.getElementsByClassName("vedi-playlist")[0].id = res.playlists[i]._id

          for(var j=0; j<res.users.length; j++ ){
            if(res.playlists[i]._iduser == res.users[j]._id)
            clone.getElementsByClassName("by-playlist")[0].innerHTML = "by " + res.users[j].name_user
          }

          document.getElementById("text-avvertimento").classList.remove("d-none")
          document.getElementById("loadingBox").classList.add("d-none")
          playlist.before(clone)
      }

    })
}

function checkVuoto(){  //funzione dedicata perche non voglio che ogni volta che digito una lettera cerchi quello desiderato come nella home... quindi si doppio il codice ma serve per renderlo dinamico con onkeyup

    var searchNome = document.getElementById("search-esplora").value
    var searchBy = document.getElementById("search-esplora-by").value
    var searchTags = document.getElementById("search-esplora-tags").value
    searchTags = searchTags.split(', ')

    if(searchNome.length <= 0 && searchBy.length <= 0 && searchTags[0].length <= 0){
      seeLastTenPlay()
    }

}


//################################################# PLAYLIST PUBBLICA #################################################

//VISTA SINGOLA PLAYLIST PUBBLICA

function viewPlaylistPubblica(){

  var urlParams = new URLSearchParams(window.location.search); //prendo id song passato tramite url... tricksss
  var idplaylist= urlParams.get('idplaylist');

  fetch("http://127.0.0.1:"+port+"/esplora/playlistPubblica?idplaylist=" + idplaylist, {
            method: 'GET',
            headers: {
              "Content-Type": "application/json"
          }
        }).then(res => res.json()) // or res.text()
        .then(res => {

          console.log(res)
          document.getElementById("titolo-playlist").innerHTML = res.nome
          document.getElementById("descrizione-playlist").innerHTML = res.descrizione
          document.getElementsByClassName("btn-song")[0].id = res._id
          for(var i=0,allTags=''; i<res.tags.length; i++){
            allTags = allTags + " " + res.tags[i]
          }
          document.getElementById("tags-playlist").innerHTML = allTags

          seeTracksPlaylistPubblica(res.songs)

        })

}

//MOSTRA CANZONI INTERNO A PLAYLIST SINGOLA PUBBLICA

function seeTracksPlaylistPubblica(songs){

  console.log(songs)

  for(var i=0; i<songs.length; i++){

    fetch("https://api.spotify.com/v1/tracks/" + songs[i], {
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + access_token,
            },
          }).then(res => res.json()) // or res.text()
          .then(res => {

              var song = document.getElementsByClassName("song")[0]
              var clone = song.cloneNode(true)
              clone.classList.remove('d-none')
              clone.getElementsByClassName("titolo-song")[0].innerHTML = res.name
              clone.getElementsByClassName("artista-song")[0].innerHTML = res.artists[0].name
              clone.getElementsByClassName("img-song")[0].src = res.album.images[2].url
              clone.getElementsByClassName("uscita-song")[0].innerHTML = res.album.release_date
              clone.getElementsByClassName("durata-song")[0].innerHTML = genera_durata(res.duration_ms)
              song.before(clone)

          })

  }

}

function importa(idPlaylistPub){

  var iduser = sessionStorage.getItem("_iduser")

  var data = {
    "_iduser": iduser,
    "idplaylist": idPlaylistPub,
    "tipo": "importata"
}

fetch("http://127.0.0.1:"+port+"/users/playlistPersonali/add", {
          method: 'POST',
          headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data) 
      }).then(res => res.json()) // or res.text()
      .then(res => {

        console.log(res)
        if(res.acknowledged == true)
          alert("playlist importata")
        else 
        alert("playlist gia importata")
        

      })

}