/* globals google */
import { useCallback, useState, useEffect, Fragment, useRef } from "react";
import "./App.css";
import { downloadAndParse } from "./data";
import {
	withScriptjs,
	withGoogleMap,
	GoogleMap,
	Marker,
	Circle,
} from "react-google-maps";
import MarkerWithLabel from "react-google-maps/lib/components/addons/MarkerWithLabel";

const circleOptions = { strokeColor: "#800080" };
const labelAnchor = { x: 0, y: 0 };
const labelStyle = {
	backgroundColor: "rgba(146,23,88,0.75)",
	color: "white",
	textAlign: "center",
	fontSize: "14px",
	padding: "32px 32px",
	borderBottomLeftRadius: "100%",
	borderTopRightRadius: "100%",
	borderBottomRightRadius: "100%",
	maxWidth: "200px",
};

const MyMapComponent = withScriptjs(
	withGoogleMap((props) => {
		const mapRef = useRef(null);
		const [zoom, setZoom] = useState(3);
		const [bounds, setBounds] = useState(null);

		const handleRef = useCallback((ref) => {
			mapRef.current = ref;
		}, []);

		const handleZoom = useCallback(() => {
			if (mapRef.current) {
				setZoom(mapRef.current.getZoom());
			}
		}, []);

		const handleBounds = useCallback(() => {
			if (mapRef.current) {
				setBounds(mapRef.current.getBounds());
			}
		}, []);

		return (
			<GoogleMap
				ref={handleRef}
				onZoomChanged={handleZoom}
				onBoundsChanged={handleBounds}
				defaultZoom={3}
				defaultCenter={{ lat: 15.4962509, lng: 20.2136032 }}
			>
				{props.locations.map((location) => {
					const {
						id,
						coords,
						state,
						country,
						confirmed,
						deaths,
						recovered,
					} = location;
					const name = `${state} ${country}`.trim();

					const inBounds = bounds && bounds.contains(coords);
					const inBoundsAndZoom = zoom >= 6 && inBounds;
					return (
						<Fragment key={id}>
							{inBounds && (
								<Circle
									center={coords}
									radius={Math.log(confirmed) * 20000}
									options={circleOptions}
								/>
							)}
							{inBoundsAndZoom && (
								<MarkerWithLabel
									position={coords}
									labelAnchor={labelAnchor}
									labelStyle={labelStyle}
								>
									<div>
										<span style={{ fontSize: "1.2em", fontWeight: "bold" }}>
											{name}
										</span>{" "}
										<br />
										<br /> Confirmed: {confirmed}
										<br /> Deaths: {deaths}
										<br /> Recovered: {recovered}
									</div>
								</MarkerWithLabel>
							)}
						</Fragment>
					);
				})}
			</GoogleMap>
		);
	})
);

function App() {
	const [locations, setLocations] = useState([]);

	useEffect(() => {
		async function run() {
			let locations = await downloadAndParse();

			const locationsGrouped = {};
			locations.forEach((location) => {
				const id = `${location.state} ${location.country}`;
				const coords = { lat: location.latitude, lng: location.longitude };

				if (locationsGrouped[id]) {
					locationsGrouped[id] = {
						...locationsGrouped[id],
						confirmed: locationsGrouped[id].confirmed + location.confirmed,
						deaths: locationsGrouped[id].deaths + location.deaths,
						recovered: locationsGrouped[id].recovered + location.recovered,
					};
				} else {
					locationsGrouped[id] = location;
					locationsGrouped[id].id = id;
					locationsGrouped[id].coords = coords;
				}
			});

			const newLocations = Object.values(locationsGrouped).filter(
				({ latitude, longitude }) => latitude && longitude
			);
			setLocations(newLocations);
		}
		run();
	}, []);

	return (
		<div className="App">
			<MyMapComponent
				locations={locations}
				googleMapURL="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places"
				loadingElement={<div style={{ height: `100%` }} />}
				containerElement={<div style={{ height: `100vh` }} />}
				mapElement={<div style={{ height: `100%` }} />}
			/>
		</div>
	);
}

export default App;
