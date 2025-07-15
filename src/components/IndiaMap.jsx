import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

const geoUrl = 'https://raw.githubusercontent.com/ramserran/indian-states-geojson/master/india_states.geojson';

export default function IndiaMap({ locations }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 h-full">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Device Locations</h3>
      <div className="h-[500px] w-full">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            center: [82.8, 22],
            scale: 1000
          }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#E2E8F0"
                  stroke="#FFFFFF"
                  strokeWidth={0.5}
                />
              ))
            }
          </Geographies>
          {locations?.map((location, i) => (
            <Marker key={i} coordinates={[location.longitude, location.latitude]}>
              <circle r={6} fill="#F87171" stroke="#FFF" strokeWidth={2} />
              <text
                textAnchor="middle"
                y={-10}
                style={{ fontFamily: "system-ui", fill: "#5D5A6D", fontSize: "10px" }}
              >
                {location.city}
              </text>
            </Marker>
          ))}
        </ComposableMap>
      </div>
    </div>
  );
}
