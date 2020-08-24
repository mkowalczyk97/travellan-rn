import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {useSelector} from 'react-redux';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
/* IMPORTS FROM WITHIN THE MODULE */
import {mapStyle} from './MapStyle';
import Colors from 'constants/Colors';

const Map = (props) => {
  const tripId = props.route.params.tripId;
  const selectedTrip = useSelector((state) =>
    state.trips.availableTrips.find((item) => item.id === tripId),
  );
  const extractRegion = () => {
    return selectedTrip.region;
  };

  /** STATE VARIABLES AND STATE SETTER FUNCTIONS */
  const [currentPosition, setCurrentPosition] = useState(selectedTrip.region);
  const [markers, setMarkers] = useState([]);
  const [addingMarkerActive, setAddingMarkerActive] = useState(false);
  const [deletingMarkerActive, setDeletingMarkerActive] = useState(false);
  const [routeActive, setRouteActive] = useState(false);
  const [mapSearchActive, setMapSearchActive] = useState(false);
  const [showPlaceInfo, setShowPlaceInfo] = useState(false);
  const [placeToSearch, setPlaceToSearch] = useState('');
  // temporary
  const [activeMarker, setActiveMarker] = useState();
  const [markerTitle, setMarkerTitle] = useState('');

  /** HANDLERS */
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
      (error) => console.log(error.message),
      {timeout: 20000, maximumAge: 1000},
    );
  }, [currentPosition]);

  const addingActivityHandler = () => {
    if (!addingMarkerActive) {
      setDeletingMarkerActive(false);
      setMapSearchActive(false);
      setRouteActive(false);
    }
    setAddingMarkerActive(!addingMarkerActive);
  };

  const deletingActivityHandler = () => {
    if (!deletingMarkerActive) {
      setAddingMarkerActive(false);
      setMapSearchActive(false);
      setRouteActive(false);
    }
    setDeletingMarkerActive(!deletingMarkerActive);
  };

  const routeActivityHandler = () => {
    if (!routeActive) {
      setAddingMarkerActive(false);
      setDeletingMarkerActive(false);
      setMapSearchActive(false);
    }
    setRouteActive(!routeActive);
  };

  const searchActivityHandler = () => {
    if (!mapSearchActive) {
      setAddingMarkerActive(false);
      setDeletingMarkerActive(false);
      setRouteActive(false);
    }
    setMapSearchActive(!mapSearchActive);
  };

  const getMarkerDetails = (coords) => {
    if (markerTitle !== '') {
      const title = markerTitle;
      const {latitude, longitude} = coords.nativeEvent.coordinate;
      setMarkers([...markers, {title, latitude, longitude}]);
      setMarkerTitle('');
    } else {
      console.log('enter title!'); // refactor error to show in UI
    }
  };

  return (
    <View style={styles.flex}>
      {/* DYNAMIC MAP VIEW */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.flex}
        customMapStyle={mapStyle}
        initialRegion={extractRegion()}
        showsUserLocation={true}
        showsMyLocationButton={true}
        loadingEnabled={true}
        loadingIndicatorColor={Colors.primary}
        loadingBackgroundColor={Colors.background}
        tintColor={Colors.primary}
        onPoiClick={(event) => console.log(event.nativeEvent)} // later used for showing more info
        onPress={(event) =>
          addingMarkerActive ? getMarkerDetails(event) : setShowPlaceInfo(false)
        }>
        {markers.map(
          (marker) =>
            markers && (
              <MapView.Marker
                coordinate={{
                  latitude: marker.latitude,
                  longitude: marker.longitude,
                }}
                title={marker.title}
                description={marker.description}
                pinColor={Colors.primary}
                onPress={(event) =>
                  !addingMarkerActive &&
                  (setShowPlaceInfo(true),
                  setActiveMarker(event._dispatchInstances.memoizedProps))
                }
              />
            ),
        )}
      </MapView>
      {/* INTERACTIVE OVERLAY */}
      <View style={styles.overlay}>
        <View style={styles.actionBar}>
          {/* GO BACK */}
          <View>
            <TouchableOpacity
              styles={styles.button}
              onPress={() => props.navigation.goBack()}>
              <MaterialIcon name="arrow-back" style={styles.icon} />
            </TouchableOpacity>
          </View>
          {/* ADD MARKER */}
          <View
            style={{
              backgroundColor: addingMarkerActive
                ? Colors.background
                : Colors.cards,
            }}>
            <TouchableOpacity
              styles={styles.button}
              onPress={addingActivityHandler}>
              <Icon name="map-marker-plus" style={styles.icon} />
            </TouchableOpacity>
          </View>
          {/* DELETE MARKER */}
          <View
            style={{
              backgroundColor: deletingMarkerActive
                ? Colors.background
                : Colors.cards,
            }}>
            <TouchableOpacity
              styles={styles.button}
              onPress={deletingActivityHandler}>
              <Icon name="map-marker-minus" style={styles.icon} />
            </TouchableOpacity>
          </View>
          {/* SEE A ROUTE BETWEEN TWO MARKERS */}
          <View
            style={{
              backgroundColor: routeActive ? Colors.background : Colors.cards,
            }}>
            <TouchableOpacity
              styles={styles.button}
              onPress={routeActivityHandler}>
              <Icon name="map-marker-path" style={styles.icon} />
            </TouchableOpacity>
          </View>
          {/* SEARCH FOR PLACE */}
          <View
            style={{
              backgroundColor: mapSearchActive
                ? Colors.background
                : Colors.cards,
            }}>
            <TouchableOpacity
              styles={styles.button}
              onPress={searchActivityHandler}>
              <Icon name="map-search" style={styles.icon} />
            </TouchableOpacity>
          </View>
        </View>
        {/** USER INPUT */}
        <View style={{alignItems: 'center'}}>
          {/* SEARCH BAR: render when mapSearchActive is true */}
          {mapSearchActive && (
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Address or name of place"
                placeholderTextColor={'grey'}
                style={styles.input}
                onChangeText={(text) => setPlaceToSearch(text)}
                value={placeToSearch}
              />
              <View style={{position: 'absolute', right: 0}}>
                <TouchableOpacity styles={styles.button}>
                  <MaterialIcon name="search" style={styles.icon} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          {/* TITLE: render when addingMarkerActive is true */}
          {addingMarkerActive && (
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Add title"
                placeholderTextColor={'grey'}
                style={styles.input}
                onChangeText={(text) => setMarkerTitle(text)}
                value={markerTitle}
              />
            </View>
          )}
        </View>
      </View>
      {/* SHOW PLACE INFO: render when showPlaceInfo is true */}
      {showPlaceInfo && (
        <View
          style={{
            width: '67%',
            height: '20%',
            position: 'absolute',
            bottom: 0,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            alignSelf: 'center',
            backgroundColor: Colors.background,
          }}>
          <View style={{padding: 10}}>
            <Text style={{color: Colors.text}}>{activeMarker.title}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  flex: {
    flex: 1,
  },
  overlay: {
    top: 0,
    position: 'absolute',
    width: '100%',
    justifyContent: 'flex-end',
    backgroundColor: Colors.cards,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  inputContainer: {
    width: '100%',
    justifyContent: 'center',
    backgroundColor: Colors.cards,
  },
  input: {
    width: '100%',
    padding: 15,
    paddingLeft: 20,
    borderTopWidth: 1,
    borderColor: Colors.text,
    fontSize: 14,
    color: Colors.text,
  },
  button: {
    backgroundColor: Colors.text,
    padding: 20,
  },
  icon: {
    padding: 15,
    fontSize: 28,
    color: Colors.text,
  },
  text: {
    color: Colors.text,
  },
});

export default Map;