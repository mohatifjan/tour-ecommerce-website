


export const displayMap = (locations)=>{

    mapboxgl.accessToken = 'pk.eyJ1IjoiYXRpZmtoYW4wNyIsImEiOiJja3V6cjFmOWYwM3hiMnFtc2kxYTI0a3phIn0.wJSvQYHR5qsdUMpjncQRqg';
    
    var map = new mapboxgl.Map({
        container: 'map',       // this already specify in in html pug #map
        style: 'mapbox://styles/mapbox/streets-v11',
        scrollZoom:false
        // center:[-118.113491, 34.111745],
        // zoom:4,
        // interactive:false
    });
    
    const bounds = new mapboxgl.LngLatBounds();
    
    locations.forEach(loc=>{
        // Create marker
        const el = document.createElement('div');
        el.className = 'marker';
        // Add Marker
        new mapboxgl.Marker({
            element: el,
            anchor:'bottom'
        }).setLngLat(loc.coordinates).addTo(map);
    
        // Add pop up
        new mapboxgl.Popup({
            offset:30
        }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description} </p>`).addTo(map)
    
        // Extends map bounds to include current location
        bounds.extend(loc.coordinates);
    })
    map.fitBounds(bounds,{
        padding:{
            top:200,
            bottom:150,
            left:100,
            right:100
        }
    });
}
