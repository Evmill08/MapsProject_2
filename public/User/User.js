import {v4 as uuidv4} from'uuid';

/*
 * User will have username input, then they will have a userID to be unique
    We will store a vector of recent searches and favorited locations
    We will also store their current location as "Home"? (maybe, idk. May do more research on how to keep like a map of locations
    and the most pinged from is there home.) 
 */

class User{
    constructor(username){
        this.username = username;
        this.userID = uuidv4();
        let recents = new Array;
        let favorites = new Array;
    }

    get username() {
        return this.username
    }

    get userID() {
        return this.userID;
    }

    // Input validation later
    set username(new_username) {
        this.username = username;
    }

    get recents() {
        return this.recents;
    }

    get favorites() {
        return this.favorites;
    }

    // Keep arrays of length 10, if full, move everything else down and replace oldest
    // Keep strings as favorites/locations to keep User as high level as possible
    addToRecents(new_location){
        if (length(this.recents) < 10){
            this.recents.push(new_location);
        } else {
            let new_array = new Array;
            for (var i = 1; i != 10; ++i){
                new_array.push(this.recents[i]);
            }

            this.recents = new_array;
        }
    }

    addToFavorites(new_location){
        if (length(this.favorites) < 10){
            this.favorites.push(new_location);
        } else {
            let new_array = new Array;
            for (var i = 1; i != 10; ++i){
                new_array.push(this.favorites[i]);
            }

            this.recents = new_array;
        }
    }
}