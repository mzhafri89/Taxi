import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import AppBar from "@material-ui/core/AppBar";
import Slider from "@material-ui/core/Slider";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Toolbar from "@material-ui/core/Toolbar";

const containerStyle = {
  width: "100%",
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

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      marginRight: 10,
      marginLeft: 10,
      marginTop: 10,
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: "center",
      color: theme.palette.text.secondary,
      overflow: "hidden",
    },
    taxiCountGutter: {
      height: 20,
    },
    title: {
      flexGrow: 1,
    },
  })
);

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
      intervalID = setInterval(setTaxisPosition, 10000); //TODO: interval time should be in env config
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

  const classes = useStyles();

  return (
    <>
    <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            The Taxi
          </Typography>
        </Toolbar>
      </AppBar>
    <div className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={2}>
          <Paper className={classes.paper}>
            <Grid container spacing={1} direction="column">
              <Grid item xs={12}>
                <Typography id="discrete-slider" gutterBottom>
                  Locations
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={changeLocationToSingapore}
                  fullWidth
                >
                  Singapore
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={changeLocationToLondon}
                  fullWidth
                >
                  London
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={changeLocationToCurrent}
                  fullWidth
                >
                  Current
                </Button>
              </Grid>
            </Grid>
            <div className={classes.taxiCountGutter} />
            <Grid container>
              <Grid xs={12} alignContent="flex-start">
                <Typography id="discrete-slider" gutterBottom>
                  Taxi Count
                </Typography>
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
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={10}>
          <Paper className={classes.paper}>
            {isLoaded && (
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
            )}
          </Paper>
        </Grid>
      </Grid>
    </div>
    </>
  );
}

export default App;
