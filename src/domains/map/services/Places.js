import axios from 'axios';
import {LOCATION_IQ} from 'react-native-dotenv';

const api_key = LOCATION_IQ;

/* SEARCH: https://eu1.locationiq.com/v1/search.php?key=YOUR_PRIVATE_TOKEN&q=SEARCH_STRING&format=json */

export async function search(query) {
  return await axios
    .get(
      `https://eu1.locationiq.com/v1/search.php?key=${api_key}&q=${query}&format=json`,
    )
    .then((json) => console.log(json));
}

/* AUTOCOMPLETE: https://api.locationiq.com/v1/autocomplete.php?key=YOUR_PRIVATE_TOKEN&q=SEARCH_STRING
  maximum length query: 200
  ?limit = [1 to 20]
  ?tag - restricts results to specific types of elements
      To restrict results to cafes: tag=amenity:cafe 
*/

export async function autocomplete(query) {
  return await axios
    .get(
      `https://eu1.locationiq.com/v1/autocomplete.php?key=${api_key}&q=${query}`,
    )
    .then((json) => console.log(json));
}
