const cardsContainer = document.querySelector('#cards-container');
const tourForm = document.querySelector('#create-tour');
const addTourButton = document.querySelector('#add-tour-button');
const closeFormButton = document.querySelector('#close-create-tour-modal-btn');
const form = document.querySelector("form"),
    titleInput = document.querySelector('#title'),
    descriptionInput = document.querySelector('#description');

// Register service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then(() => console.log('service worker registered'))
        .catch(err => console.log(err));
}

const openTourForm = () => {
    tourForm.style.display = "block";
};

const closeTourForm = () => {
    tourForm.style.display = "none";
};

const submitForm = () => {
    fetch(url, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          id: new Date().toISOString(),
          title: titleInput.value,
          description: descriptionInput.value,
          image: "https://firebasestorage.googleapis.com/v0/b/tours-offline-demo.appspot.com/o/hampi.png?alt=media&token=13147e46-27aa-41d7-b658-67c331ec05a5"
        })
      })
      .then((res) => {
        console.log('Posted data: ', res);
        updateCards();
      });
}

const submitAndCloseForm = () => {
    closeTourForm();
    submitForm();
};

addTourButton.addEventListener('click', openTourForm);
closeFormButton.addEventListener('click', closeTourForm);
form.addEventListener("submit", function(event){
    event.preventDefault();

    if (titleInput.value.trim() === '' || descriptionInput.value.trim() === ''){
        alert('Please enter valid data');
        return;
    }

    submitAndCloseForm();
});

// Clear the cards
function clearCards() {
    while(cardsContainer.hasChildNodes()) {
      cardsContainer.removeChild(cardsContainer.lastChild);
    }
  }

const updateCards = (tours) => {
    // Clear all the cards before updating
    clearCards();

    tours.forEach(tour => {
        const cardWrapper = document.createElement('div');
        cardWrapper.className = 'demo-card-square mdl-card mdl-shadow--2dp inline-block';
        const cardTitle = document.createElement('div');
        cardTitle.className = 'mdl-card__title';
        cardTitle.style.backgroundImage = `url(${tour.image})`;
        cardTitle.style.backgroundSize = 'cover';
        cardTitle.style.height = '180px';
        cardWrapper.appendChild(cardTitle);
        const cardTitleTextElement = document.createElement('h2');
        cardTitleTextElement.style.color = 'white';
        cardTitleTextElement.className = 'mdl-card__title-text';
        cardTitleTextElement.textContent = tour.title || '';
        cardTitle.appendChild(cardTitleTextElement);
        const cardSupportingText = document.createElement('div');
        cardSupportingText.className = 'mdl-card__supporting-text';
        cardSupportingText.textContent = tour.description || '';
        cardSupportingText.style.textAlign = 'center';
        const cardAction = document.createElement('div');
        cardAction.className = 'mdl-card__actions mdl-card--border';
        cardAction.innerHTML = '<a class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect">More Info</a>';

        cardWrapper.appendChild(cardSupportingText);
        cardWrapper.appendChild(cardAction);
        cardsContainer.appendChild(cardWrapper);
    })
}

const url = 'https://tours-offline-demo.firebaseio.com/tours.json';
var networkDataReceived = false;

fetch(url)
    .then(res => {
        return res.json();
    })
    .then(data => {
        networkDataReceived = true;
        console.log('Fetched tour details', data);
        updateCards(Object.values(data));
    });

if ('indexedDB' in window) {
    readData('tours')
        .then(function (data) {
            if (!networkDataReceived) {
                console.log('From cache', data);
                updateCards(data);
            }
        });
}