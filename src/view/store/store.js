import {createStore, applyMiddleware} from 'redux';
import Reducer from '../reducer/RootReducer'
import { createEpicMiddleware } from 'redux-observable';
import rootEpic from '../epic/index';
// import {createLogger} from 'redux-logger'



// Create the redux logging middleware
// const loggerMiddleware = createLogger()

/**
 * config store
 * @returns {Store<any>}
 */
function configureStore() {
    const epicMiddleware = createEpicMiddleware(rootEpic());
    return createStore(
        Reducer,
        {},
        applyMiddleware(
            epicMiddleware,
            // loggerMiddleware
        )
    );
}

export default configureStore();