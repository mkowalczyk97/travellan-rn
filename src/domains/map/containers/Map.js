import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, ActivityIndicator} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
/* imports from within the module */
import * as mapActions from 'map/state/Actions';
import Toolbar from 'map/components/toolbar/Toolbar';
import PlaceOverview from 'map/components/placeOverview/PlaceOverview';
import {darkModeMap} from './DarkModeMap';
import {mapStyle as styles} from './MapStyle';
import Colors from 'constants/Colors';
import {Autocomplete} from 'map/data/DummyAutocomplete';

const Map = (props) => {
  const dispatch = useDispatch();

  const tripId = props.route.params.tripId;
  const selectedTrip = useSelector((state) =>
    state.trips.availableTrips.find((item) => item.id === tripId),
  );

  const extractRegion = () => selectedTrip.region;

  const [currentRegion, setCurrentRegion] = useState(selectedTrip.region);
  const [currentPosition, setCurrentPosition] = useState(selectedTrip.region);
  const [markers, setMarkers] = useState(
    selectedTrip.map ? selectedTrip.map.pointsOfInterest : [],
  );
  const [addingMarkerActive, setAddingMarkerActive] = useState(false);
  const [deletingMarkerActive, setDeletingMarkerActive] = useState(false);
  const [routeActive, setRouteActive] = useState(false);
  const [mapSearchActive, setMapSearchActive] = useState(false);
  const [showPlaceInfo, setShowPlaceInfo] = useState(false);
  const [placeToSearch, setPlaceToSearch] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [activeMarker, setActiveMarker] = useState();
  const [markerTitle, setMarkerTitle] = useState('');
  const [focusedPlace, setFocusedPlace] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const AUTOCOMPLETE = Autocomplete;

  /* handlers */
  useEffect(() => {
    Geolocation.getCurrentPosition(
      (position) => {
        //console.log(JSON.stringify(position))
        const {longitude, latitude} = position.coords;
        setCurrentPosition({
          ...currentPosition,
          longitude,
          latitude,
        });
      },
      (err) => setError(err.message),
      {timeout: 20000, maximumAge: 1000},
    );
  }, [currentPosition]);

  // handles activity on the toolbar
  const activityHandler = (type) => {
    switch (type) {
      case 'adding':
        if (!addingMarkerActive) {
          setDeletingMarkerActive(false);
          setMapSearchActive(false);
          setRouteActive(false);
          setFocusedPlace();
          setPlaceToSearch('');
        } else {
          setMarkerTitle('');
        }
        setAddingMarkerActive(!addingMarkerActive);
        break;
      case 'deleting':
        if (!deletingMarkerActive) {
          setAddingMarkerActive(false);
          setMapSearchActive(false);
          setRouteActive(false);
          setFocusedPlace();
          setPlaceToSearch('');
          setMarkerTitle('');
        }
        setDeletingMarkerActive(!deletingMarkerActive);
        break;
      case 'route':
        if (!routeActive) {
          setAddingMarkerActive(false);
          setDeletingMarkerActive(false);
          setMapSearchActive(false);
          setFocusedPlace();
          setPlaceToSearch('');
          setMarkerTitle('');
        }
        setRouteActive(!routeActive);
        break;
      case 'search':
        if (!mapSearchActive) {
          setAddingMarkerActive(false);
          setDeletingMarkerActive(false);
          setRouteActive(false);
          setMarkerTitle('');
        } else {
          setFocusedPlace();
          setPlaceToSearch('');
        }
        setMapSearchActive(!mapSearchActive);
        break;
    }
  };

  // handles marker onPress action
  const markerOnPressHandler = async (coords) => {
    // save received coordinates to local variables
    const {latitude, longitude} = coords.nativeEvent.coordinate;
    // find the pressed marker's info
    let marker = markers.filter(
      (item) => item.lat === latitude && item.lon === longitude,
    )[0];
    // do something with saved coordinates
    if (deletingMarkerActive) {
      // start loading
      setIsLoading(true);
      // dispatch an action to create a new point of interest
      await dispatch(mapActions.deletePoI(tripId, marker.id)).then(async () => {
        // filter markers so that they exclude the marker with the coordinates
        setMarkers(markers.filter((item) => item.id !== marker.id));
        // change saved region to current one
        await dispatch(mapActions.updateRegion(tripId, currentRegion));
        // fetch changed map object
        await dispatch(mapActions.fetchMap(tripId));
      });
      // stop loading
      setIsLoading(false);
    } else {
      setActiveMarker(marker);
    }
  };

  // handles map onPress action
  const mapOnPressHandler = async (coords) => {
    // save received coordinates to local variables
    const {latitude, longitude} = coords.nativeEvent.coordinate;
    // do something with saved coordinates
    if (addingMarkerActive) {
      if (markerTitle !== '') {
        const title = markerTitle;
        // start loading
        setIsLoading(true);
        // dispatch an action to create a new point of interest
        await dispatch(
          mapActions.createPoI(tripId, latitude, longitude, title),
        ).then(async () => {
          // change saved region to current one
          await dispatch(mapActions.updateRegion(tripId, currentRegion));
          // refresh markers
          setMarkers([...selectedTrip.map.pointsOfInterest]);
          // clear marker title
          setMarkerTitle('');
        });
        // stop loading
        setIsLoading(false);
      } else {
        setError('Enter the title'); // refactor error to show in UI
      }
    } else {
      setShowPlaceInfo(false);
    }
  };

  return (
    <View style={styles.flex}>
      {/* render dynamic MapView */}
      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size={'large'} color={Colors.primary} />
        </View>
      ) : (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.flex}
          customMapStyle={darkModeMap}
          initialRegion={extractRegion()}
          onRegionChangeComplete={(region) => setCurrentRegion(region)}
          showsUserLocation={true}
          showsMyLocationButton={true}
          loadingEnabled={true}
          loadingIndicatorColor={Colors.primary}
          loadingBackgroundColor={Colors.background}
          tintColor={Colors.primary}
          onPress={(event) => mapOnPressHandler(event)}>
          {/* render markers */}
          {!focusedPlace &&
            !!markers &&
            markers.map((marker) => (
              <MapView.Marker
                coordinate={{
                  latitude: marker.lat,
                  longitude: marker.lon,
                }}
                pinColor={Colors.primary}
                onPress={(event) => markerOnPressHandler(event)}>
                <MapView.Callout onPress={() => setShowPlaceInfo(true)}>
                  <Text>{marker.title}</Text>
                </MapView.Callout>
              </MapView.Marker>
            ))}
          {!!focusedPlace && (
            <MapView.Marker
              coordinate={{
                latitude: parseFloat(focusedPlace.lat),
                longitude: parseFloat(focusedPlace.lon),
              }}
              pinColor={Colors.primary}
              onPress={(event) => markerOnPressHandler(event)}>
              <MapView.Callout onPress={() => setShowPlaceInfo(true)}>
                <Text>{focusedPlace.title}</Text>
              </MapView.Callout>
            </MapView.Marker>
          )}
        </MapView>
      )}

      {/* render toolbar for map interaction */}
      <Toolbar
        styles={styles}
        navigation={props.navigation}
        addingMarkerActive={addingMarkerActive}
        addingActivityHandler={() => activityHandler('adding')}
        markerTitle={markerTitle}
        setMarkerTitle={(text) => setMarkerTitle(text)}
        deletingMarkerActive={deletingMarkerActive}
        deletingActivityHandler={() => activityHandler('deleting')}
        routeActive={routeActive}
        routeActivityHandler={() => activityHandler('route')}
        mapSearchActive={mapSearchActive}
        searchActivityHandler={() => activityHandler('search')}
        placeToSearch={placeToSearch}
        setPlaceToSearch={(text) => setPlaceToSearch(text)}
        autocomplete={AUTOCOMPLETE}
        showAutocomplete={showAutocomplete}
        setShowAutocomplete={() => setShowAutocomplete(!showAutocomplete)}
        error={error}
        setError={() => setError()}
        // focusedPlace, setFocusedPlace
        focusedPlace={focusedPlace}
        setFocusedPlace={(place) => setFocusedPlace(place)}
      />

      {/* render place details */}
      {showPlaceInfo && (
        <PlaceOverview styles={styles} activeMarker={activeMarker} />
      )}

      {/* render bottom actions */}
      {!!focusedPlace && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <TouchableOpacity
            style={{
              backgroundColor: Colors.cards,
              paddingHorizontal: 25,
              paddingVertical: 12,
              margin: 5,
              borderRadius: 50,
            }}>
            <Text style={styles.text}>Add</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: Colors.cards,
              paddingHorizontal: 25,
              paddingVertical: 12,
              margin: 5,
              borderRadius: 50,
            }}>
            <Text style={styles.text}>Discard</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default Map;
