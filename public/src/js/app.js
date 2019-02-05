// Register service worker
if('serviceWorker' in navigator){
    navigator.serviceWorker
        .register('/sw.js')
        .then(() => console.log('service worker registered'))
        .catch(err => console.log(err));
}