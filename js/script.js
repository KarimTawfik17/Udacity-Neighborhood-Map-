// My favourite Places' Locations1
var Locations = [{
        name: 'Future University',
        lat: 30.026262426291698,
        lng: 31.49153709411621
    },
    {
        name: 'Concord Plaza',
        lat: 30.024924803465204,
        lng: 31.48256778717041
    },
    {
        name: 'Point 90 cinema',
        lat: 30.020354455970544,
        lng: 31.49501323699951
    },
    {
        name: 'Zohor Club',
        lat: 30.017121643955335,
        lng: 31.49132251739502
    },
    {
        name: 'AUC',
        lat: 30.018923856756835,
        lng: 31.499669551849365
    },
    {
        name: 'Moon Valley',
        lat: 30.0232899066123,
        lng: 31.487717628479004
    },
    {
        name: 'Porto New Cairo',
        lat: 30.02582584304764,
        lng: 31.49803876876831
    },
    {
        name: 'Maxim Country Club',
        lat: 30.03193783349391,
        lng: 31.499165296554565
    },
    {
        name: 'C House Milano',
        lat: 30.030015105093792,
        lng: 31.496247053146362
    },
    {
        name: 'Family City',
        lat: 30.032903827888045,
        lng: 31.48654818534851
    }

];

// Declaring all global variables
var map;
// API keys for FourSquare api
var clientID = 'FGRUTMIURLCUWNUCK5GSTM2CWZGWXHOLZ0AU1OFY3GBPC1GE';
var clientSecret = 'YSYKVOWNRKXAIIGACC212GDA1CHNVFEIZ2AMFVTF4TQEDVVC';

// Data of each Location
var Location = function(data) {
    var self = this;
    this.name = data.name;
    this.lat = data.lat;
    this.lng = data.lng;
    this.URL = "";
    this.street = "";
    this.city = "";
    this.phone = "";

    this.visible = ko.observable(true);

    var foursquareURL = 'https://api.foursquare.com/v2/venues/search?ll=' + this.lat + ',' + this.lng + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20160118' + '&query=' + this.name;

    $.getJSON(foursquareURL).done(function(data) {
        var results = data.response.venues[0];
        self.URL = '<a href="' + results.url + '">' + results.url + '</a>';
        if (typeof results.url === 'undefined') {
            self.URL = '<span class="undefined">No Url Available</span>';
        }
        self.street = results.location.formattedAddress[0];
        self.city = results.location.formattedAddress[1];
        self.phone = '<a href="tel:' + results.contact.phone + '">' + results.contact.phone + '</a>';
        if (typeof results.contact.phone === 'undefined') {
            self.phone = '<span class="undefined">No Phone Number Available</span>';
        }
    }).fail(function() {
        alert("Error Loading foursquare Api to get information about places");
    });

    this.infoWindow = new google.maps.InfoWindow();

    this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(data.lat, data.lng),
        icon: 'img/map-pin.svg',
        map: map,
        title: data.name
    });
    this.showMarker = ko.computed(function() {
        Location.resetColor;
        if (this.visible() === true) {
            this.marker.setMap(map);
        } else {
            this.marker.setMap(null);
        }
        return true;
    }, this);

    this.marker.addListener('click', function() {
        self.contentString = '<div class="info-window-content"><div class="title"><b>' + data.name + "</b></div>" +
            '<div class="content">' + self.URL + '</div>' +
            '<div class="content">' + self.street + "</div>" +
            '<div class="content">' + self.city + "</div>" +
            '<div class="content">' + self.phone + '</div></div>';

        self.infoWindow.setContent(self.contentString);

        self.infoWindow.open(map, this);

        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            self.marker.setAnimation(null);
        }, 3000);
    });
    // add animation to marker
    this.bounce = function(place) {
        google.maps.event.trigger(self.marker, 'click');
    };

    // change marker on hover of place title
    this.changeColor = function(place) {
        self.marker.setIcon('img/male.svg');
    };
    this.resetColor = function(place) {
        self.marker.setIcon('img/map-pin.svg');
    };
};

function Octupus() {
    var self = this;

    this.searchTerm = ko.observable("");

    this.locationList = ko.observableArray([]);

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: {
            lat: 30.026262426291698,
            lng: 31.49153709411621
        }
    });


    Locations.forEach(function(locationItem) {
        self.locationList.push(new Location(locationItem));
    });

    this.filteredList = ko.computed(function() {
        var filter = self.searchTerm().toLowerCase();
        if (!filter) {
            self.locationList().forEach(function(locationItem) {
                locationItem.visible(true);
            });
            return self.locationList();
        } else {
            return ko.utils.arrayFilter(self.locationList(), function(locationItem) {
                var string = locationItem.name.toLowerCase();
                var result = (string.search(filter) >= 0);
                locationItem.visible(result);
                return result;
            });
        }
    }, self);
}

// start application now
function runApplication() {
    ko.applyBindings(new Octupus());
}

// handle if maps api doesn't load
function handleError() {
    alert("Maps Error, Check your internet connection");
}