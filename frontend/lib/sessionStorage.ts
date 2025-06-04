import {Storage} from 'redux-persist';

const sessionStorageWrapper: Storage = {
    getItem: (key) => Promise.resolve(sessionStorage.getItem(key)),
    setItem: (key, value) => Promise.resolve(sessionStorage.setItem(key, value)),
    removeItem: (key) => Promise.resolve(sessionStorage.removeItem(key)),
};

export default sessionStorageWrapper;
