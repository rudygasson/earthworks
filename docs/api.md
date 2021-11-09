# Earthworks REST API

Version 0.0.1

## Structure

| URL pattern                 | Response format       | Description                                                  |
| :-------------------------- | --------------------- | :----------------------------------------------------------- |
| `./earthworks/{id:int}`     | GeoJSON Point or Line | All details for a specific earthwork. GeoJSON feature (point or line?) with all details for earthwork `id`. |
| `./earthworks?{filter parameters}` | GeoJSON feature list  | Filter for a GeoJSON feature list with only coordinate data for each point. The list should be filtered via a given parameter set. The current return limit is a maximum of 1000 entries. |
| `area=<Number>`| | Filter parameter: Number of the area to retrieve data for |
| `next_pi=<due/overdue/alldue/good>`| | Filter parameter: Time frame for principal inspection  |
| `road=<Number>`| | Filter parameter: Road number to retrieve data for |
| `./areas`        | JSON                  | List of aggregated data for count and length of required inspections for all areas.                     |
| `./areas?q=table` | JSON | List of aggregated data per area. The sums of the required inspections for the *in-year* and  *backlog* categories for *count* and *length* are returned separately. |

### Examples

## Details for a single earthwork

`{base_url}/earthworks/11074`
```JSON
{
  "geometry": {
    "coordinates": [
      [
        521591,
        205915
      ],
      [
        521640,
        206117
      ]
    ],
    "type": "LineString"
  },
  "properties": {
    "angle_at_max_height_degrees": 7.88,
    "area_dbfo": 5,
    "earthwork_length_m": 284.57,
    "earthwork_number": 11074,
    "earthwork_type": "Embankment",
    "end_easting": 521640,
    "end_northing": 206117,
    "highest_CS641_feature_grade": 3,
    "highest_initial_feature_grade": 3,
    "insitu_geology": "GSG - GLACIAL SAND AND GRAVEL",
    "last_complete_inspection_date": "02/16/2012 00:00:00",
    "last_inspection_date_partial": "02/16/2012 00:00:00",
    "next_principal_inspection_date": "02/16/2022 00:00:00",
    "principal_inspection_return_period_years": 10,
    "return_period_assessed": "TRUE",
    "road": "A1M",
    "start_easting": 521591,
    "start_northing": 205915,
    "status": "Approved",
    "year_of_construction": "01/01/1968 00:00"
  },
  "type": "Feature"
}
```

## List of all earthworks of road M40 in area 30 that are in the backlog

`{base_url}/earthworks?next_pi=overdue&area=30&road=M40`
```JSON
{
  "features": [
    {
      "geometry": {
        "coordinates": [
          [
            455191,
            219570
          ],
          [
            455566,
            219522
          ]
        ],
        "type": "LineString"
      },
      "properties": {
        "area_dbfo": 30,
        "earthwork_number": 3080,
        "next_principal_inspection_date": "11/17/2008 00:00:00"
      },
      "type": "Feature"
    },
    {
      "geometry": {
        "coordinates": [
          [
            504557,
            185772
          ],
          [
            504735,
            185748
          ]
        ],
        "type": "LineString"
      },
      "properties": {
        "area_dbfo": 30,
        "earthwork_number": 25012,
        "next_principal_inspection_date": "05/08/2012 00:00"
      },
      "type": "Feature"
    },
    {
      "geometry": {
        "coordinates": [
          [
            504704,
            185726
          ],
          [
            504560,
            185745
          ]
        ],
        "type": "LineString"
      },
      "properties": {
        "area_dbfo": 30,
        "earthwork_number": 25033,
        "next_principal_inspection_date": "03/24/2014 00:00:00"
      },
      "type": "Feature"
    }
  ],
  "type": "FeatureCollection"
}
```
