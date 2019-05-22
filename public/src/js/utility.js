const prepareDb = idb.openDb('tours-db', 1, (db) => {
    if (!db.objectStoreNames.contains('tours')) {
        db.createObjectStore('tours', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('sync-tours')) {
        db.createObjectStore('sync-tours', { keyPath: 'id' });
    }
});

// Write data to a particular store
const writeData = (st, data) => {
    return prepareDb
        .then((db) => {
            let tx = db.transaction(st, 'readwrite');
            let store = tx.objectStore(st);
            store.put(data);
            return tx.complete;
        });
};

// Read data from a store
const readData = (st) => {
    return prepareDb
        .then(db => {
            let tx = db.transaction(st, 'readonly');
            let store = tx.objectStore(st);
            return store.getAll();
        });
};

// Remove all data from a store
const clearAllData = (st) => {
    return prepareDb
        .then(function (db) {
            var tx = db.transaction(st, 'readwrite'); // start transaction block
            var store = tx.objectStore(st);
            store.clear();
            return tx.complete; // Complete transaction block
        });
}

// remove item by id
function deleteItemFromData(st, id) {
    return prepareDb
      .then(function(db) {
        var tx = db.transaction(st, 'readwrite');
        var store = tx.objectStore(st);
        store.delete(id);
        return tx.complete;
      })
      .then(function() {
        console.log('Item deleted!');
      });
  }