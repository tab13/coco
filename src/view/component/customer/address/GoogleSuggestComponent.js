import React from 'react';
import PropTypes from 'prop-types';
import {CoreComponent} from '../../../../framework/component/index';
import {GoogleApiWrapper} from 'google-maps-react';
import i18n from "../../../../config/i18n";

class GoogleSuggestComponent extends CoreComponent {
    static className = 'GoogleSuggest';

    timeout = null;

    /**
     * constructor
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            suggestList: []
        };
        this.google = this.props.google;
        this.getCircle();
        this.displaySuggestions = this.displaySuggestions.bind(this);
    }

    /**
     * component did mount
     */
    componentDidMount() {
        this.autoComplete = new this.google.maps.places.AutocompleteService();
        let map = new this.google.maps.Map(document.getElementById('map'), {});
        this.placeService = new this.google.maps.places.PlacesService(map);
    }

    /**
     * get circle by current position
     */
    getCircle() {
        let self = this;
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                let geolocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                self.circle = new self.google.maps.Circle({
                    center: geolocation,
                    radius: position.coords.accuracy
                });
            }, function (err) {

            });
        }
    }

    /**
     * Component Will Receive Props
     */
    componentWillReceiveProps(nextProps) {
        if (this.props.input !== nextProps.input) {
            if (nextProps.input.length) {
                let params = {
                    input: nextProps.input
                };
                if (this.circle) {
                    params.bounds = this.circle.getBounds();
                }
                if (this.timeout) {
                    clearTimeout(this.timeout);
                }
                this.timeout = setTimeout(
                    () => this.autoComplete.getQueryPredictions(params, this.displaySuggestions),
                    30
                );
            } else {
                this.resetSuggestList();
            }
        }
    }

    componentWillUnmount() {
        clearTimeout(this.timeout);
    }

    /**
     * resetSuggestList
     */
    resetSuggestList() {
        this.setState({
            suggestList: []
        });
    }

    /**
     * Display suggest list
     * @param predictions
     * @param status
     */
    displaySuggestions(predictions, status) {
        if (status !== this.google.maps.places.PlacesServiceStatus.OK) {
            this.resetSuggestList();
            return;
        }
        this.setState({
            suggestList: predictions
        });
    }

    /**
     * Handle click suggest place
     * @param place
     */
    handleClickSuggestPlace(place) {
        this.placeService.getDetails({
            placeId: place.place_id
        }, this.handlePlaceDetail.bind(this));
    }

    /**
     * Handle Place Detail
     * @param place
     * @param status
     */
    handlePlaceDetail(place, status) {
        if (status !== this.google.maps.places.PlacesServiceStatus.OK) {
            return;
        }
        let locationInfo = this.exportLocationInfo(place);
        this.props.setLocationInfo(locationInfo);

    }

    /**
     * Export location info from place detail
     * @param place
     * @returns {{street: {street1: *, street2: *}, city: *, region_id: *, region: *, country_id: *, postcode: *}}
     */
    exportLocationInfo(place) {
        let componentForm = {
            street_number: 'short_name',
            route: 'long_name',
            locality: 'long_name',
            administrative_area_level_1: 'short_name',
            country: 'short_name',
            postal_code: 'short_name',
            sublocality_level_1: 'long_name'
        };
        let street, city, region_id, region, country, postcode, sublocality;

        for (let i = 0; i < place.address_components.length; i++) {
            let addressType = place.address_components[i].types[0];
            if (componentForm[addressType]) {
                if (addressType === 'street_number') {
                    if (street)
                        street += ' ' + place.address_components[i][componentForm['street_number']];
                    else
                        street = place.address_components[i][componentForm['street_number']];
                }
                if (addressType === 'route') {
                    if (street)
                        street += ' ' + place.address_components[i][componentForm['route']];
                    else
                        street = place.address_components[i][componentForm['route']];
                }
                if (addressType === 'locality')
                    city = place.address_components[i][componentForm['locality']];
                if (addressType === 'administrative_area_level_1') {
                    region_id = place.address_components[i]['long_name'];
                    region = place.address_components[i]['long_name'];
                }
                if (addressType === 'country')
                    country = place.address_components[i][componentForm['country']];
                if (addressType === 'postal_code')
                    postcode = place.address_components[i][componentForm['postal_code']];

                if (addressType === 'sublocality_level_1')
                    sublocality = place.address_components[i][componentForm['sublocality_level_1']];
            }
        }

        return {
            street: {
                street1: street,
                street2: sublocality,
            },
            city: city,
            region_id: region_id,
            region: region,
            country_id: country,
            postcode: postcode
        }
    }


    template() {
        return (
            <div className={this.state.suggestList.length ? "google-suggest" : "hidden"}>
                <div id="map"></div>
                <ul className="suggest-items">
                    {
                        this.state.suggestList.map(place =>
                            <li className="suggest-item"
                                key={Math.random()}
                                onClick={() => this.handleClickSuggestPlace(place)}
                            >
                                <strong className="title">{place.description}</strong>
                                <span className="subtitle">{place.structured_formatting.secondary_text}</span>
                            </li>
                        )
                    }
                </ul>
            </div>
        )
    }
}

GoogleSuggestComponent.propTypes = {
    input: PropTypes.string.isRequired,
    setLocationInfo: PropTypes.func.isRequired
};

const google_wapper =  GoogleApiWrapper(
    (props) => ({
        apiKey: props.apiKey,
        libraries: ['places'],
        language: i18n.language,
    })
)(GoogleSuggestComponent);

export default google_wapper;