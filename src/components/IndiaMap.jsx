import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

const geoUrl = 'https://gist.githubusercontent.com/jbrobst/56c13bbbf9d97d187fea01ca62ea5112/raw/e388c4cae20aa53cb5090210a42ebb9b765c0a36/india_states.geojson';

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
