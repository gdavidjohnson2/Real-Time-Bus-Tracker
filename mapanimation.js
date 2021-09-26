function checkInfinite() {
    runForever = document.getElementById("infinite").checked;
    if (timer === null) {
        run();
    }
}
var count = 0;
finalCount = 4;
var runForever = false;
var timer = null;
var countDownTimer = null;
var cd = 15;
const buses = [];


async function run() {
    // get bus data
    clearTimeout(countDownTimer);

    document.getElementById("updateStatus").innerText = "Updating...";
    const locations = await getBusLocations();
    console.log(new Date());
    addBusMarkers(locations);
    count += 1;

    checkCount(); //allows for us to set a stop condition for when we've reached a certain number (finalCount)
}

// Request bus data from MBTA
async function getBusLocations() {
    const url =
        "https://api-v3.mbta.com/vehicles?filter[route]=1&include=trip";
    const response = await fetch(url);
    const json = await response.json();
    return json.data;
}


function checkCount() {
    if (finalCount > count) {
        if (runForever === true) {
            document.getElementById("runto").innerText =
                count + " updates of Infinite";
            //finalCount = count + 1;
        } else {
            document.getElementById("runto").innerText =
                count + " updates of " + finalCount;
        }
        cd = 15; //resets the counter on the countdown timer
        countDown();
        timer = setTimeout(run, 15000);
    } else {
        if (runForever === true) {
            document.getElementById("runto").innerText =
                count + " updates of Infinite";
            finalCount = count + 1;
            cd = 15; //resets the counter on the countdown timer
            countDown();
            timer = setTimeout(run, 15000);
        } else {
            document.getElementById("runto").innerText =
                count + " updates of " + finalCount;
            document.getElementById("updateStatus").innerText =
                "No additional updates";
            clearTimeout(timer);
            timer = null;
        }
    }
}
function countDown() {
    cd -= 1;
    document.getElementById("updateStatus").innerText =
        cd + " seconds until the next update.";
    countDownTimer = setTimeout(countDown, 1000);
}


function addBusMarkers(location) {
    for (i = 0; i < location.length; i++) {
        //console.log(location[i].attributes);
        // check if there are already buses in the array
        if (buses.length > 0) {
            //check each bus and update
            var busExists = false; // set reset the check value;
            for (j = 0; j < buses.length; j++) {
                if (buses[j].id === location[i].attributes.label) {
                    buses[j].coordinates = {
                        lng: location[i].attributes.longitude,
                        lat: location[i].attributes.latitude,
                    };
                    buses[j].occupancy_status =
                        location[i].attributes.occupancy_status;
                    // update the marker position if it exists
                    buses[j].marker.setLngLat([
                        location[i].attributes.longitude,
                        location[i].attributes.latitude,
                    ]);
                    // update the popup label if it's already there to update the occupancy
                    buses[j].marker.getPopup()._content.innerHTML =
                        '<button class="mapboxgl-popup-close-button" type="button" aria-label="Close popup">×</button>' +
                        location[i].attributes.label +
                        " : " +
                        location[i].attributes.occupancy_status;
                    busExists = true;
                }
            }
            // if no match is found in the buses array, add a bus/marker
            if (busExists === false) {
                marker = new mapboxgl.Marker()
                    .setLngLat([
                        location[i].attributes.longitude,
                        location[i].attributes.latitude,
                    ])
                    .setPopup(
                        new mapboxgl.Popup().setText(
                            location[i].attributes.label +
                                " : " +
                                location[i].attributes.occupancy_status
                        )
                    ) // add popup
                    .addTo(map);
                buses.push({
                    id: location[i].attributes.label,
                    marker: marker,
                    coordinates: {
                        lng: location[i].attributes.longitude,
                        lat: location[i].attributes.latitude,
                    },
                    occupancy_status: location[i].attributes.occupancy_status,
                });
            }
            // if there are no buses in the array, add the bus/marker
        } else {
            marker = new mapboxgl.Marker()
                .setLngLat([
                    location[i].attributes.longitude,
                    location[i].attributes.latitude,
                ])
                .setPopup(
                    new mapboxgl.Popup().setText(
                        location[i].attributes.label +
                            " : " +
                            location[i].attributes.occupancy_status
                    )
                )
                .addTo(map);

            buses.push({
                id: location[i].attributes.label,
                marker: marker,
                coordinates: {
                    lng: location[i].attributes.longitude,
                    lat: location[i].attributes.latitude,
                },
            });
        }
        if (buses.length > location.length) {
            console.log("there are more buses than locations...");
        }
    }
}