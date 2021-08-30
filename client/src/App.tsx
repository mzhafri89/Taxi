import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import CssBaseline from "@material-ui/core/CssBaseline";
import Container from "@material-ui/core/Container";
import Button from "@material-ui/core/Button";
import AppBar from "@material-ui/core/AppBar";
import Slider from "@material-ui/core/Slider";

const containerStyle = {
  width: "100vh",
  height: "600px",
};

interface PositionData {
  longitude: number;
  latitude: number;
  bearing: number;
}

interface TaxiData {
  driver_id: string;
  location: PositionData;
}

function App() {
  const [position, setPosition] = useState<PositionData>({
    longitude: 103.8522982,
    latitude: 1.285194,
    bearing: 0,
  });
  const [taxis, setTaxis] = useState<[TaxiData] | null>(null);
  const [taxiCount, setTaxiCount] = useState<number>(10);

  async function getTaxisPosition(
    longitude: number,
    latitude: number,
    count: number
  ) {
    try {
      const response = await axios.get(
        `/api/taxis?latitude=${latitude}&longitude=${longitude}&count=${count}`
      );
      if (response) return response;
      return null;
    } catch (error) {
      return null;
    }
  }

  function setToCurrentPosition() {
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) =>
        setPosition({ longitude, latitude, bearing: 0 })
    );
  }

  useEffect(setToCurrentPosition, []);

  useEffect(() => {
    async function setTaxisPosition() {
      const request = await getTaxisPosition(
        position?.longitude,
        position?.latitude,
        taxiCount
      );
      if (request) setTaxis(request?.data?.drivers ?? []);
    }
    let intervalID: any;
    if (position?.latitude && position?.longitude) {
      setTaxisPosition();
      intervalID = setInterval(setTaxisPosition, 10000);//TODO: interval time should be in env config
    }

    return () => {
      if (intervalID) clearInterval(intervalID);
    };
  }, [position?.latitude, position?.longitude, taxiCount]);

  const changeLocationToSingapore = useCallback(
    () =>
      setPosition({
        latitude: 1.285194,
        longitude: 103.8522982,
        bearing: 0,
      }),
    []
  );

  const changeLocationToLondon = useCallback(
    () =>
      setPosition({
        latitude: 51.5049375,
        longitude: -0.0964509,
        bearing: 0,
      }),
    []
  );

  const changeLocationToCurrent = useCallback(setToCurrentPosition, []);

  const updateTaxiCount = useCallback(
    (_: any, value: any) => {
      if (value !== taxiCount) setTaxiCount(value);
    },
    [taxiCount]
  );

  const valueText = useCallback((value: number) => `${value}`, []);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyBWerOUyFloxkqH9kPk5o18uOn_F4KbuCg", //TODO: Use env config
  });

  return isLoaded ? (
    <>
      <CssBaseline />
      <Container fixed>
        <AppBar position="static">
          <Button
            variant="contained"
            color="primary"
            onClick={changeLocationToSingapore}
          >
            Singapore
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={changeLocationToLondon}
          >
            London
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={changeLocationToCurrent}
          >
            Current
          </Button>
          <Slider
            defaultValue={10}
            getAriaValueText={valueText}
            aria-labelledby="discrete-slider"
            valueLabelDisplay="auto"
            step={10}
            marks
            min={10}
            max={50}
            color="secondary"
            onChange={updateTaxiCount}
          />
        </AppBar>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={{
            lat: position.latitude,
            lng: position.longitude,
          }}
          zoom={15}
        >
          <>
            {taxis?.map((driver: TaxiData) => (
              <Marker
                key={driver.driver_id}
                position={{
                  lat: driver.location.latitude,
                  lng: driver.location.longitude,
                }}
              />
            ))}
          </>
        </GoogleMap>
      </Container>
    </>
  ) : (
    <></>
  );
}

export default App;
