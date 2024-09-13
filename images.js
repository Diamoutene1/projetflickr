"use strict";
// Déclarer une variable globale map initialisée à null
let map = null;
// Déclarer une variable globale allMarkers initialisée à une liste vide
let allMarkers = [];


function init() {

    // Initialiser la carte avec la position (0, 0) et un niveau de zoom de 2
    map = L.map('carte').setView([0, 0], 2);
    
    let rechercheForm = document.getElementById('recherche');
    rechercheForm.addEventListener('submit', recherche);

     // Ajouter un fond de carte OpenStreetMap
     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

function recherche(event) {
    event.preventDefault();

    let mots = document.getElementById('mots').value.trim();

    if (mots === '') {
        let erreur = document.getElementById('erreur');
        erreur.textContent = 'Il faut saisir une recherche non vide';
        return;
    }

    let apiKey = "7d22d0f2074417eb56750dd864f975de";
    let method = "flickr.photos.search";
    let format = "json";

    //let flickrApiUrl = `https://api.flickr.com/services/rest/?method=${method}&api_key=${apiKey}&text=${mots}&format=${format}&nojsoncallback=1`;

    //modification TP10
    let flickrApiUrl = `https://api.flickr.com/services/rest/?method=${method}&api_key=${apiKey}&text=${mots}&has_geo=1&format=${format}&nojsoncallback=1`;


    let requete = new XMLHttpRequest();
    requete.open("GET", flickrApiUrl);
    requete.responseType = "json";
    requete.addEventListener("load", afficheReponse);
    requete.send();
}

function afficheReponse(event) {
    let response = event.target.response;
   

    // Vérifier si la réponse contient une erreur
    if (response.stat === "fail") {
        let erreur = document.getElementById('erreur');
        erreur.textContent = response.message;
        return;
    }
    console.log(response)
    // Récupérer la liste des résultats
    let photos = response.photos.photo;

    // Vérifier si la liste des résultats est vide
    if (photos.length === 0) {
        let erreur = document.getElementById('erreur');
        erreur.textContent = 'Aucun résultat trouvé.';
        return;
    }

    // Afficher les images dans la section des résultats
    let resultatDiv = document.getElementById('resultats');
    resultatDiv.innerHTML = ''; // Effacer le contenu précédent

    photos.forEach(photo => {
        let imageUrl = `https://live.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_s.jpg`;
        let imageElement = document.createElement('img');
        imageElement.src = imageUrl;
        imageElement.alt = photo.title;
        imageElement.title = photo.title;
        imageElement.dataset.photoId= photo.id;
        resultatDiv.appendChild(imageElement);
        imageElement.addEventListener('click',getDetails)
    });
    console.log(photos)
    

    
}

function getDetails(event) {
    


    // Construire l'URL de la requête pour obtenir les détails de l'image
    let apiKey = "7d22d0f2074417eb56750dd864f975de";
    let method = "flickr.photos.getInfo";
    let photoId = event.currentTarget.dataset.photoId
    let format = "json";
    let extras = "geo"; // Ajout du paramètre extras avec la valeur geo Tp10
    //let flickrApiUrl = `https://api.flickr.com/services/rest/?method=${method}&api_key=${apiKey}&photo_id=${photoId}&format=${format}&nojsoncallback=1`;

    //nouvel url TP10
     let flickrApiUrl = `https://api.flickr.com/services/rest/?method=${method}&api_key=${apiKey}&photo_id=${photoId}&format=${format}&extras=${extras}&nojsoncallback=1`;

   
    // Envoyer une nouvelle requête XHR pour obtenir les détails de l'image
    let requete = new XMLHttpRequest();
    requete.open("GET", flickrApiUrl);
    requete.responseType = "json";
    requete.addEventListener("load", afficheDetails);
    requete.send();
}

function afficheDetails(event) {
    let photoDetails = event.target.response.photo;
    console.log(photoDetails)

    // Extraire les détails de l'image de la réponse
    let titre = photoDetails.title._content;
    let description = photoDetails.description._content;
    let dateCreation = new Date(parseInt(photoDetails.dates.posted) * 1000);
    let pseudoProprietaire = photoDetails.owner.username;

     // Récupérer les coordonnées de géolocalisation de l'image
     let latitude = parseFloat(photoDetails.location.latitude);
     let longitude = parseFloat(photoDetails.location.longitude);
 
     // Centrer la carte sur la géolocalisation de l'image et zoomer sur ce point (niveau de zoom de 10)
     map.setView([latitude, longitude], 10);
 
     // Placer un marqueur sur la géolocalisation de l'image
     let marker = L.marker([latitude, longitude]).addTo(map);
 
     // Créer le contenu de la popup
     let popupContent = `
         <div>
             <img src="https://live.staticflickr.com/${photoDetails.server}/${photoDetails.id}_${photoDetails.secret}_q.jpg" alt="${titre}" style="width: 75px; height: 75px;">
             <h3>${titre}</h3>
             <p>${description}</p>
             <p><a href="https://www.flickr.com/photos/${photoDetails.owner.nsid}/${photoDetails.id}" target="_blank">Voir sur Flickr</a></p>
         </div>
     `;
 
     // Associer la popup au marqueur et l'ouvrir automatiquement
     marker.bindPopup(popupContent).openPopup();
 
     // Ajouter le marqueur à la liste allMarkers
     allMarkers.push(marker);

     




    // Afficher les détails de l'image dans la section details
    let detailsDiv = document.getElementById('details');
    detailsDiv.innerHTML = ''; // Effacer le contenu précédent

    // Titre de l'image
    let titleElement = document.createElement('h2');
    titleElement.textContent = titre;
    detailsDiv.appendChild(titleElement);

    // Description de l'image
    if (description) {
        let descriptionElement = document.createElement('p');
        descriptionElement.textContent = description;
        detailsDiv.appendChild(descriptionElement);
    }

    // Affichage de l'image en grand
    let imageUrl = `https://live.staticflickr.com/${photoDetails.server}/${photoDetails.id}_${photoDetails.secret}_b.jpg`;
    let imageElement = document.createElement('img');
    imageElement.src = imageUrl;
    imageElement.alt = titre;
    detailsDiv.appendChild(imageElement);

    // Création de l'élément pour la date de création de l'image et le pseudo du propriétaire
    let infoElement = document.createElement('p');

    // Date de création de l'image
    let dateCreationText = document.createTextNode("Photo prise le: " + dateCreation.toLocaleDateString());
    infoElement.appendChild(dateCreationText);

    // Pseudo du propriétaire avec lien vers sa page Flickr
    let ownerLink = document.createElement('a');
    ownerLink.textContent = " par " + pseudoProprietaire;
    ownerLink.href = `https://www.flickr.com/people/${photoDetails.owner.nsid}/`;
    infoElement.appendChild(ownerLink);

    // Ajout de l'élément dans la section details
    detailsDiv.appendChild(infoElement);

      // Vérifier si des informations de localisation sont disponibles
      if (photoDetails.location) {
        let locationElement = document.createElement('p');
        locationElement.textContent = `Localisation: Latitude ${photoDetails.location.latitude}, Longitude ${photoDetails.location.longitude}`;
        detailsDiv.appendChild(locationElement);}


         // Récupérer les coordonnées des coins opposés de la carte
         let bounds = map.getBounds();
         let ne = bounds.getNorthEast();
         let sw = bounds.getSouthWest();
 
         // Construire la requête pour obtenir les images géolocalisées sur la zone de la carte
         let apiKey ="7d22d0f2074417eb56750dd864f975de" ;
         let method = "flickr.photos.search";
         let bbox = `${sw.lng},${sw.lat},${ne.lng},${ne.lat}`;
         let extras = "geo,url_l,description"; // Ajouter les données de géolocalisation, l'URL de l'image en taille moyenne et la description
         let format = "json";
         let perPage = 20; // Limiter le nombre de réponses à 20
         let flickrApiUrl = `https://api.flickr.com/services/rest/?method=${method}&api_key=${apiKey}&bbox=${bbox}&extras=${extras}&format=${format}&per_page=${perPage}&has_geo=1&nojsoncallback=1`;
 
         // Envoyer une nouvelle requête XHR pour obtenir les images géolocalisées sur la zone de la carte
         let requete = new XMLHttpRequest();
         requete.open("GET", flickrApiUrl);
         requete.responseType = "json";
         requete.addEventListener("load", function(event) {
             let response = event.target.response;
             if (response && response.photos && response.photos.photo) {
                 let photos = response.photos.photo;
                 // Supprimer tous les marqueurs précédents
                 allMarkers.forEach(marker => {
                     marker.remove();
                 });
                 allMarkers = []; // Réinitialiser la liste des marqueurs
                 // Ajouter des marqueurs pour chaque photo
                 photos.forEach(photo => {
                     let marker = L.marker([photo.latitude, photo.longitude]).addTo(map);
                     marker.bindPopup(`<img src="${photo.url_l}" alt="${photo.title}" width="75" height="75"><br>${photo.description}<br><a href="https://www.flickr.com/photos/${photo.owner}/${photo.id}">Voir sur Flickr</a>`).openPopup();
                     allMarkers.push(marker); // Ajouter le marqueur à la liste
                 });
             }
         });
         requete.send();
     }





    

