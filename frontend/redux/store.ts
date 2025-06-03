import {configureStore} from '@reduxjs/toolkit';
import {combineReducers} from 'redux';

import {FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE,} from 'redux-persist';
import {Persistor} from 'redux-persist/es/types';
import storage from 'redux-persist/lib/storage';

import userReducer from '../features/user/userSlice';
import produitReducer from '../features/produit/produitSlice';


const rootReducer = combineReducers({
    user: userReducer,
    produit: produitReducer
});

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['user'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export const persistor: Persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;