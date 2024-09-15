const path = require('path');
const mongoClient = require('mongodb').MongoClient; //richiesta libreria
const ObjectId = require('mongodb').ObjectId;
const express = require('express')
const app = express()
app.use(express.json()) //Analizza le richieste JSON in arrivo e inserisce i dati analizzati in req.body
const port = 3100
const uri = "mongodb+srv://Biffi:Veroale03992018@pwm.waprajm.mongodb.net"; ///?retryWrites=true&w=majority

const crypto = require('crypto')
var cors = require('cors')
app.use(cors())

const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('../api/docs/swagger-output.json')
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

//################################################# METODI GEST. REQUEST #################################################

//CRYPTA PASSWORD 

function hash(input) {
  return crypto.createHash('md5')
    .update(input)
    .digest('hex')
}

//AGGIUNGI UTENTE

async function addUser(res, user) { //AGGIUNGI UTENTE 


  if (user.email == '') {
    res.status(400).send("Email non inserita")
    return
  }

  if (user.name_user == '') {
    res.status(400).send("Nickname non inserito")
    return
  }

  var special = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/; //per includere una lettera maiuscola, un numero e un char speeciale
  if (user.password == undefined || user.password.length < 7 || !user.password.match(special)) {
    res.status(400).send("Controlla che la password sia uguale e maggiore di 7. Deve contenere almeno un/una:\n-lettera maiuscola\n-numero\n-carattere speciale")
    return
  }




  user.password = hash(user.password)

  var snmClient = await new mongoClient(uri).connect()

  // snmClient.db("SNM").collection('users').createIndex({
  //     "email": 1
  // }, {
  //     unique: true
  // })
  // snmClient.db("SNM").collection('users').createIndex({
  //   "name_user": 1
  // }, {
  //     unique: true
  // })

  /*essendo l'email e nickname sono impostati come unici sul DB, bisogna gestire caso in cui utente 
  cerca di registrarsi con un email/nickname gia' presente sul DB */
  try {
    var items = await snmClient.db("SNM").collection('users').insertOne(user)
    res.json(items)

  } catch (e) {
    console.log('catch in test');
    if (e.code == 11000) { //se logghiamo e esce code: 11000, che rappresenta errore di duplicate key
      res.status(400).send("Email o nickname già presente")
      return
    }
    res.status(500).send(`Errore generico: ${e}`)

  };
}

//ELIMINA UTENTE

async function deleteUser(res, name_user) {

  var filter = {
    "name_user": name_user
  }

  try {
    var snmClient = await new mongoClient(uri).connect()

    //eliminazioni playlist account da eliminare

    var userInfo = await snmClient.db("SNM")
      .collection('users')
      .findOne(filter)

    console.log(userInfo)

    var filter_user = {
      "_iduser": userInfo._id.toString() //per rimuovere new objectId...
    }

    console.log(filter_user)

    var userDelete_playlists = await snmClient.db("SNM")
      .collection('playlist')
      .deleteMany(filter_user)

    console.log(userDelete_playlists)

    //vado a segnare importFrom come "account eliminato", cosi se qualcunoi ha imporato la playlist da questo utente gli resta (viewplaylistPersonali) 

    var filter_import_user = {
      "importFrom": userInfo._id.toString() //per rimuovere new objectId...
    }

    await snmClient.db("SNM")
      .collection('playlist')
      .updateMany(filter_import_user, {
        $set: {
          "importFrom": '(account eliminato)'
        }
      })

    //eliminazione account vero e proprio

    var userDelete = await snmClient.db("SNM")
      .collection('users')
      .deleteOne(filter) //modifica nel DB
    res.json(userDelete)

  } catch (e) {
    console.log(e)
    res.status(500).send(`Errore generico: ${e}`)
  }
}

//CAMBIA DATI UTENTE

async function updateUser(res, updatedUser) {

  try {

    console.log(updatedUser)


    if (updatedUser.password == "") {
      if (updatedUser.name_user == '') { //check che non isa vuoto anche nickname da cambiare
        res.status(400).send("Missing new username")
        return
      }
      var newDataUser = {
        "name_user": updatedUser.name_user
      }

    } else {

      //check prima di aggiornare
      var special = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/; //per includere una lettera maiuscola, un numero e un char speeciale
      if (updatedUser.password == '' || updatedUser.password.length < 7 || !updatedUser.password.match(special)) {
        res.json("Controlla che la password sia uguale e maggiore di 7. Deve contenere almeno un/una:\n-lettera maiuscola\n-numero\n-carattere speciale")
        return
      }

      var newDataUser = {
        "password": updatedUser.password
      }
      newDataUser.password = hash(newDataUser.password)
      //console.log(filter)
    }
    //console.log(newDataUser)

    var newDataUserToInsert = {
      $set: newDataUser
    }

    var filter = {
      "_id": new ObjectId(updatedUser.id_user)
    }

    var snmClient = await new mongoClient(uri).connect()
    var item = await snmClient.db("SNM")
      .collection('users')
      .updateOne(filter, newDataUserToInsert) //modifica nel DB
    res.send(newDataUser)

  } catch (e) {
    console.log('catch in test');
    if (e.code == 11000) {
      res.json("Utente già presente (user gia presente nel DB)")
      return
    }
    res.status(500).send(`Errore generico: ${e}`)

  };
}

//LOGGA UTENTE

async function loginUser(res, login) {

  if (login.name_user == undefined) {
    res.status(400).send("Missing username")
    return
  }
  if (login.password == undefined) {
    res.status(400).send("Missing Password")
    return
  }

  login.password = hash(login.password)

  var snmClient = await new mongoClient(uri).connect()

  var filter = {
    $and: [{
        "name_user": login.name_user
      },
      {
        "password": login.password
      }
    ]
  }

  var loggedUser = await snmClient.db("SNM").collection('users').findOne(filter);

  console.log(loggedUser)

  if (loggedUser == null) {
    res.status(401).send("Unauthorized")
    return
  } else {
    res.send({
      loggedUser
    })
  }

}

//FUNZ AGGIUNGI PLAYLIST

async function addPlaylistPersonale(res, playlist) {

  console.log(playlist)

  if (playlist.tipo == "pubblica" || playlist.tipo == "privata") {

    //console.log("sono in false")

    if (playlist.nome == '' || playlist.descrizione == '' || playlist.tags == '' || playlist.tipo == '' || playlist.tipo == "TIPO") {
      res.status(400).json("Errore: compila tutti i campi")
      return
    }

    try {

      playlist.data_creazione = new Date().toISOString().split('T')[0]

      var snmClient = await new mongoClient(uri).connect()
      var item = await snmClient.db("SNM").collection('playlist').insertOne(playlist)
      res.send(item)

    } catch (e) {

      res.status(500).send(`Errore generico: ${e}`)

    }

  } else if (playlist.tipo == "importata") {

    //console.log("sono in true")
    try {

      filter = {
        "_id": new ObjectId(playlist.idplaylist) //trovo dati playlist che voglio importare
      }

      var snmClient = await new mongoClient(uri).connect()
      var importata = await snmClient.db("SNM").collection('playlist').findOne(filter)
      //console.log(importata)
      importata._idOriginale = importata._id //mi salvo id originale della playlist per fare controlli in caso si cerchi di importarla piu di una volta per bloccare questa operazione
      delete importata['_id']; //tolgo _id playlist pubblica cosi posso dargliene uno suo essendo ora nel mio profilo e non piu associata all'altro utente
      importata.importFrom = importata._iduser //salvo utente da cui ho importato playlist
      importata._iduser = playlist._iduser //metto il mio id collegato alla playlist
      importata.tipo = "importata"
      //console.log(importata)


      var filter = {
        $and: [{
            "_iduser": importata._iduser
          },
          {
            "_idOriginale": importata._idOriginale
          }
        ]
      }

      var check1 = await snmClient.db("SNM").collection('playlist').findOne(filter) //controllo che la playlist non sia gia stata importata
      console.log(check1)

      if (check1 == null) {
        var item = await snmClient.db("SNM").collection('playlist').insertOne(importata)
        res.send(item)
      } else {
        res.json('errore playlist gia importata')
      }

    } catch (e) {
      res.status(500).send(`Errore generico: ${e}`)
    }

  }

}

//FUNZ MOSTRA PLAYLIST PERSONALI

async function viewPlaylistsPersonali(res, id) {

  try {
    var snmClient = await new mongoClient(uri).connect()
    var item = await snmClient.db("SNM").collection('playlist').find({
      "_iduser": id
    }).toArray()
    res.send(item)
  } catch (e) {
    res.status(500).send(`Errore generico: ${e}`)
  }

}

//FUNZ DELETE PLAYLIST PERSONALE

async function deletePlaylistPersonale(res, idplaylist) {

  try {

    var filter = {
      "_id": new ObjectId(idplaylist)
    }
    console.log(filter)

    var snmClient = await new mongoClient(uri).connect()
    var item = await snmClient.db("SNM").collection('playlist').deleteOne(filter)
    res.send(item)
  } catch (e) {
    res.status(500).send(`Errore generico: ${e}`)
  }

}

//FUNZ AGGIUNTA TRACK A PLAYLIST PERSONALE

async function addTrackPlaylistPersonale(res, data) {

  if (data._idplaylist == '') {
    res.status(400).send("Missing selected playlist")
    return
  }
  if (data._idsong == '') {
    res.status(400).send("errore con id track e url")
    return
  }

  try {

    var filter_playlist = {
      "_id": new ObjectId(data._idplaylist)
    }

    var song = {
      $push: {
        "songs": data._idsong
      }
    }

    var check_song = {
      "songs": data._idsong
    }

    var snmClient = await new mongoClient(uri).connect()

    var doppione = await snmClient.db("SNM").collection('playlist').findOne(check_song)

    if (doppione == null) {
      var item = await snmClient.db("SNM").collection('playlist').updateOne(filter_playlist, song)
      res.send(item)
    } else {
      res.json('errore canzone gia presente nella playlist')
    }




  } catch (e) {
    res.status(500).send(`Errore generico: ${e}`)
  }

}

//FUNZ PER VEDERE INFO PLAYLIST PERSONALE

async function viewPlaylistPersonale(res, idplaylist) {

  var filter = {
    "_id": new ObjectId(idplaylist)
  }

  try {
    var snmClient = await new mongoClient(uri).connect()
    var playlist = await snmClient.db("SNM").collection('playlist').findOne(filter)
    res.send(playlist)
  } catch (e) {
    res.status(500).send(`Errore generico: ${e}`)
  }

}

//FUNZ PER ELIMINARE SONG DA PLAYLIST PERSONALE

async function deleteTrackPlaylistPersonale(res, id) {

  var filter_playlist = {
    "_id": new ObjectId(id.idplaylist)
  }

  var song = {
    $pull: {
      "songs": id.idsong
    }
  }

  try {
    var snmClient = await new mongoClient(uri).connect()
    var playlist = await snmClient.db("SNM").collection('playlist').updateOne(filter_playlist, song)
    res.send(playlist)
  } catch (e) {
    res.status(500).send(`Errore generico: ${e}`)
  }

}

//FUNZ PER AGGIUNGERE ARTISTI PREFERITI

async function updateArtists(res, data) {

  var filter_user = {
    "_id": new ObjectId(data._id)
  }

  console.log(data.operazione)

  if (data.operazione == "del") {
    var artist = {
      $pull: {
        "artists_favorites": data.nameArtists
      }
    }
  } else {
    var artist = {
      $push: {
        "artists_favorites": data.nameArtists
      }
    }
  }

  try {
    var snmClient = await new mongoClient(uri).connect()

    if (data.operazione == 'add') { //per evitare che con la eliminazione non esca fuori che l'artista sia gia presente nella lista
      var checkDoppione = await snmClient.db("SNM").collection('users').findOne({
        "artists_favorites": data.nameArtists
      })

      if (checkDoppione == null) {
        var artists = await snmClient.db("SNM").collection('users').updateOne(filter_user, artist)
        console.log(artist)
        res.send(artists)
      } else {
        res.status(500).send({
          "modifiedCount": 0
        })
      }
    } else if (data.operazione == 'del') {
      var artists = await snmClient.db("SNM").collection('users').updateOne(filter_user, artist)
      console.log(artist)
      res.send(artists)
    } else {
      res.status(500).send({
        "modifiedCount": 0
      })
    }

  } catch (e) {
    res.status(500).send({
      "modifiedCount": 0
    })
  }

}

//FUNZ PER MOSTRARE ARTISTI PREFERITI UTENTE

async function getArtists(res, iduser) {

  console.log(iduser)

  var filter_user = {
    "_id": new ObjectId(iduser)
  }

  try {
    var snmClient = await new mongoClient(uri).connect()
    var user = await snmClient.db("SNM").collection('users').findOne(filter_user)
    res.send(user)
  } catch (e) {
    res.status(500).send(`Errore generico: ${e}`)
  }

}

//FUNZ PER AGGIUNGERE ARTISTI PREFERITI

async function updateGenres(res, data) {

  var filter_user = {
    "_id": new ObjectId(data._id)
  }

  console.log(data.operazione)

  if (data.nameGenres == null || data.nameGenres == "")
    return

  if (data.operazione == "del") {
    var gen = {
      $pull: {
        "genres": data.nameGenres
      }
    }
  } else {
    var gen = {
      $push: {
        "genres": data.nameGenres
      }
    }
  }

  try {
    var snmClient = await new mongoClient(uri).connect()

    if (data.operazione == 'add') { //per evitare che con la eliminazione non esca fuori che l'artista sia gia presente nella lista
      var checkDoppione = await snmClient.db("SNM").collection('users').findOne({
        "genres": data.nameGenres
      })

      if (checkDoppione == null) {
        var generi = await snmClient.db("SNM").collection('users').updateOne(filter_user, gen)
        res.send(generi)
      } else {
        res.status(500).send({
          "modifiedCount": 0
        })
      }
    } else if (data.operazione == 'del') {
      var generi = await snmClient.db("SNM").collection('users').updateOne(filter_user, gen)
      res.send(generi)
    } else {
      res.status(500).send({
        "modifiedCount": 0
      })
    }

  } catch (e) {
    res.status(500).send({
      "modifiedCount": 0
    })
  }

}

//FUNZ PER MOSTRARE ARTISTI PREFERITI UTENTE

async function getGenres(res, iduser) {

  var filter_user = {
    "_id": new ObjectId(iduser)
  }
  console.log(filter_user)

  try {
    var snmClient = await new mongoClient(uri).connect()
    var user = await snmClient.db("SNM").collection('users').findOne(filter_user)
    console.log(user)
    res.send(user)
  } catch (e) {
    res.status(500).send(`Errore generico: ${e}`)
  }

}

//FUNZ CHE RITORNA PLAYLIST PUBBLICHE DI TUTTI GLI UTENTI

async function getPublicPlaylists(res, iduser, nomePlaylist, by, tags) {


  //console.log(tags)
  arrayTags = tags.split(',');
  //console.log(arrayTags)
  if (tags.length > 0) {
    for (var i = 0; i < arrayTags.length; i++) {
      arrayTags[i] = "#" + arrayTags[i]
    }
    arrayTags = {
      $all: arrayTags
    }
  } else {
    arrayTags = {
      '$regex': "^",
      '$options': 'i'
    } //all tags ok
  }

  // console.log(iduser)
  // console.log(nomePlaylist)
  // console.log(arrayTags)
  //console.log(by)



  var filter = {
    "_iduser": {
      $ne: iduser
    },
    "tipo": "pubblica",
    "nome": {
      '$regex': "^" + nomePlaylist,
      '$options': 'i'
    },
    "tags": arrayTags
  }

  //console.log(filter)



  try {
    var snmClient = await new mongoClient(uri).connect()
    var playlists = await snmClient.db("SNM").collection('playlist').find(filter).toArray() //toArray per il find normale cosi da renderlo leggibile js
    //console.log(playlists)

    var elencoIDcreatori = [] //per filtro
    for (var i = 0; i < playlists.length; i++) {
      elencoIDcreatori.push(new ObjectId(playlists[i]._iduser)) //dal elenco degli id poi associero il proprio username (genio grazie)
    }

    var filterIDs = {
      "_id": {
        "$in": elencoIDcreatori
      }, //$in seleziona i documenti in cui il valore di un campo è uguale a qualsiasi valore nell'array specificato
    }

    //console.log(filterIDs)
    var users = await snmClient.db("SNM").collection('users').find(filterIDs).project({
      name_user: 1
    }).toArray() //filtraggio{name_user: 1} per non ottenere anche pw e robe inutili
    var response = {}

    if (by) { //mostro solo creatori con il nome dato dal utente

      var playlistsReal = []
      var byID

      for (var i = 0; i < users.length; i++) {
        if (users[i].name_user == by)
          byID = users[i]._id
      }

      for (var j = 0; j < playlists.length; j++) {
        if (byID == playlists[j]._iduser) {
          console.log(playlists[j])
          playlistsReal.push(playlists[j])
        }
      }

      response.playlists = playlistsReal

    } else {
      response.playlists = playlists
    }

    response.users = users
    //console.log(response)
    res.send(response)

  } catch (e) {
    res.status(500).send(`Errore generico: ${e}`)
  }

}


//FUNZ CHE RESTITUISCE ULTIME 5 PLAYLIST PUBBLICHE CREATE DAGLI UTENTI

async function getLastPublicPlaylists(res, iduser) {

  var filter = {
    "_iduser": {
      $ne: iduser
    },
    "tipo": "pubblica"
  }

  try {
    var snmClient = await new mongoClient(uri).connect()
    var playlists = await snmClient.db("SNM").collection('playlist').find(filter).toArray()

    playlists = await snmClient.db("SNM").collection('playlist').find(filter).sort({
      data_creazione: -1
    }).limit(10).toArray() //toArray per il find normale cosi da renderlo leggibile js

    var elencoIDcreatori = [] //per filtro
    for (var i = 0; i < playlists.length; i++) {
      elencoIDcreatori.push(new ObjectId(playlists[i]._iduser)) //dal elenco degli id poi associero il proprio username (genio grazie)
    }


    var filterIDs = {
      "_id": {
        "$in": elencoIDcreatori
      } //$in seleziona i documenti in cui il valore di un campo è uguale a qualsiasi valore nell'array specificato
    }

    //console.log(filterIDs)

    var users = await snmClient.db("SNM").collection('users').find(filterIDs).project({
      name_user: 1
    }).toArray() //filtraggio{name_user: 1} per non ottenere anche pw e robe inutili
    var response = {}
    response.playlists = playlists
    response.users = users

    //console.log(response)
    res.send(response)

  } catch (e) {
    res.status(500).send(`Errore generico: ${e}`)
  }

}



//FUNZ PER VEDERE INFO PLAYLIST SINGOLA PUBBLICA

async function viewPlaylistPubblica(res, idplaylist) {

  var filter = {
    "_id": new ObjectId(idplaylist)
  }

  try {
    var snmClient = await new mongoClient(uri).connect()
    var playlist = await snmClient.db("SNM").collection('playlist').findOne(filter)
    res.send(playlist)
  } catch (e) {
    res.status(500).send(`Errore generico: ${e}`)
  }

}

// async function get_By(res,usersPub){

//   var arrIDs = JSON.parse(usersPub)

//   console.log(arrIDs)

//   var elenco = [] //per filtro
//   for(var i=0; i<arrIDs.length; i++){
//     elenco.push(new ObjectId(arrIDs[i]))  //dal elenco degli id poi associero il proprio username (genio grazie)
//   }

//   var filter = {
//     "_id" : {"$in" : elenco}  //$in seleziona i documenti in cui il valore di un campo è uguale a qualsiasi valore nell'array specificato
//   }

//   try{

//   //ALTRO METODO CHE AVEVO FATTO E ANDAVA E MI PIACE TENERLO PER RICORDO
//   //   var ris = []
//   //   var snmClient = await new mongoClient(uri).connect()
//   //   for(var i=0; i<arrIDs.length; i++){ //con find non troverei duplicati
//   //     var user = await snmClient.db("SNM").collection('users').findOne(new ObjectId(arrIDs[i])) // possibile filtraggio{name_user: 1}
//   //     ris.push(user)
//   //   }
//   //   //console.log(ris)
//   //   res.send(ris)

//     var snmClient = await new mongoClient(uri).connect()
//     var users = await snmClient.db("SNM").collection('users').find(filter).project({ name_user: 1}).toArray() //filtraggio{name_user: 1} per non ottenere anche pw e robe inutili
//     res.send(users)

//   }catch(e){  
//     res.status(500).send(`Errore generico: ${e}`)
//   }

// }



//################################################# SERVER REQUEST #################################################

//LOGIN

app.post("/users/login", async (req, res) => {
  // #swagger.tags = ['auth']
  loginUser(res, req.body)
})


//REGISTRAZIONE

app.post("/users/registrazione", function(req, res) {
  // #swagger.tags = ['auth']
  addUser(res, req.body)
})

//ELIMINAZIONE UTENTE

app.delete("/users/delete/:username", function(req, res) {
  // #swagger.tags = ['info']
  deleteUser(res, req.params.username)
})

//MODIFICA UTENTE

app.put("/users/change/", function(req, res) { //PUT (app.put)
  // #swagger.tags = ['info']
  updateUser(res, req.body) //req.params. prende da url/:parametro ("/users/:id")
})

//MODIFICA ARTISTI PREFERITI UTENTE

app.put("/users/changeArtistsFav/", function(req, res) { //PUT (app.put)
  // #swagger.tags = ['info']
  updateArtists(res, req.body)
})

//MOSTRA ARTISTI PREFERITI UTENTE

app.get("/users/artistsFav/", function(req, res) { //GET (app.get)
  // #swagger.tags = ['info']
  getArtists(res, req.query.iduser)
})

//MODIFICA GENERI PREFERITI UTENTE

app.put("/users/changeGenresFav/", function(req, res) { //PUT (app.put)
  // #swagger.tags = ['info']
  updateGenres(res, req.body)
})

//MOSTRA GENERI PREFERITI UTENTE

app.get("/users/genresFav/", function(req, res) { //GET (app.get)
  // #swagger.tags = ['info']
  getGenres(res, req.query.iduser)
})

//AGGIUNTA PLAYLIST PERSONALE CREATA DA ME O PUBBLICA DI UN ALTRO UTENTE

app.post('/users/playlistPersonali/add', function(req, res) {
  // #swagger.tags = ['playlist']
  addPlaylistPersonale(res, req.body)
});

//VISUALIZZA PLAYLISTs PERSONALI

app.get('/users/playlistPersonali/view', function(req, res) {
  // #swagger.tags = ['playlist']
  viewPlaylistsPersonali(res, req.query.id)
});

//VISUALIZZA singola PLAYLIST PERSONALE

app.get('/users/playlistPersonali/viewOne', function(req, res) {
  // #swagger.tags = ['playlist']
  viewPlaylistPersonale(res, req.query.idplaylist)
});

//DELETE PLAYLIST PERSONALE

app.delete('/users/playlistPersonali/delete', function(req, res) {
  // #swagger.tags = ['playlist']
  deletePlaylistPersonale(res, req.query.idplaylist)
});

//AGGIUNTA TRACK A PLAYLIST PERSONALE

app.put('/users/playlistPersonali/addTrack', function(req, res) {
  // #swagger.tags = ['playlist']
  addTrackPlaylistPersonale(res, req.body)
});

//DELETE TRACK A PLAYLIST PERSONALE

app.put('/users/playlistPersonali/deleteOne', function(req, res) {
  // #swagger.tags = ['playlist']
  deleteTrackPlaylistPersonale(res, req.query)
});

//ESPLORA - RICERCA

app.get('/esplora', function(req, res) {
  // #swagger.tags = ['esplora']
  getPublicPlaylists(res, req.query.iduser, req.query.nome, req.query.by, req.query.tags)
});

//ESPLORA - no ricerca = mostra ultime 5 playlist pubbliche

app.get('/esplora/lastTen', function(req, res) {
  // #swagger.tags = ['esplora']
  getLastPublicPlaylists(res, req.query.iduser, req.query.nome, req.query.tags)
});

//VISUALIZZA singola PLAYLIST PUBBLICA

app.get('/esplora/playlistPubblica', function(req, res) {
  // #swagger.tags = ['esplora']
  viewPlaylistPubblica(res, req.query.idplaylist)
});

//OTTIENI CREATORE (by) DELLA PLAYLIST PUBBLICA

app.get('/esplora/playlistPubblica/by', function(req, res) {
  // #swagger.tags = ['esplora']
  get_By(res, req.query.usersPub)
});

//INFO ACCOUNT LOGGATO  --tenere sotto per permettere ad altri endpoint utilizzo--

app.get('/users/:username', async function(req, res) {
  // #swagger.tags = ['auth']
  var username = req.params.username //(/:username)
  var snmClient = await new mongoClient(uri).connect()
  var user = await snmClient
    .db("SNM")
    .collection('users')
    .find({
      "name_user": username
    })
    .project({
      "password": 0 //cosi non mi da la password  (id di default sempre mostrato), .project({"password" : 0. "nome": 0}) funziona, se mettessi nome ad 1 non andrebbe
    })
    .toArray();
  res.json(user)
})

//INFO SINGOLO ACCOUNT TRAMITE ID - per by inplaylist importate

app.get('/user/:id', async function(req, res) {
  // #swagger.tags = ['auth']
  filter = {
    "_id": new ObjectId(req.params.id) //trovo dati playlist che voglio importare
  }
  var snmClient = await new mongoClient(uri).connect()
  var user = await snmClient.db("SNM").collection('users').findOne(filter)
  // .project({
  //     "password": 0 //cosi non mi da la password  (id di default sempre mostrato), .project({"password" : 0. "nome": 0}) funziona, se mettessi nome ad 1 non andrebbe
  // })
  //.toArray();
  res.json(user)
})

//REINDIRIZZAMENTO

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/home.html'));
});

//CONNESIONE AVVENUTA

app.listen(port, "0.0.0.0", () => {
  console.log("Server partito porta " + port)
})